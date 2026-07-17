<?php

namespace Modules\Tenant\Packages\Import\Repositories;

use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Modules\Admin\Helpers\ReadjustmentHelper;
use Modules\Shared\Enum\EmailBodyTemplate;
use Modules\Shared\Services\MailerService;
use Modules\Shared\Utils\Date;
use Modules\Tenant\Models\Classroom;
use Modules\Tenant\Models\Participant;
use Modules\Tenant\Models\Student;
use Modules\Tenant\Packages\Import\Helpers\ImportHelper;
use Modules\Tenant\Packages\Import\Jobs\ImportJob;
use Modules\Tenant\Models\Import;
use Modules\Tenant\Models\ImportDetail;
use Modules\Tenant\Models\Course;
use Modules\Tenant\Models\Cycle;
use Modules\Tenant\Models\Period;
use Modules\Tenant\Models\ProductiveFamily;
use Modules\Tenant\Models\Section;
use Modules\Tenant\Models\Shift;
use Modules\Tenant\Models\StudyPlan;
use Modules\Tenant\Models\StudyProgram;
use Modules\Tenant\Packages\SystemConfiguration\Helpers\SystemConfigurationHelper;
use Modules\Admin\Helpers\SystemConfigurationHelper as AdminSystemConfigurationHelper;
use Modules\Tenant\Models\Enrollment;
use Modules\Tenant\Models\Person;
use Modules\Tenant\Models\Rol;
use Modules\Tenant\Models\StudentPlan;
use Modules\Tenant\Models\StudyPlanType;
use Modules\Tenant\Models\StudyPlanDetail;
use Modules\Tenant\Models\Teacher;
use Modules\Tenant\Models\User;
use Modules\Tenant\Models\WorkingCondition;
use Modules\Tenant\Packages\User\Enums\RolTenant;

class ImportRepository
{
    public static function list()
    {
        $imports = Import::selectRaw("
            import.id,
            import.key,
            import.title,
            (
                SELECT status 
                FROM import_detail 
                WHERE import_id = import.id 
                ORDER BY date DESC
                LIMIT 1
            ) AS last_status,
            (
                SELECT date
                FROM import_detail
                WHERE import_id = import.id
                ORDER BY date DESC
                LIMIT 1
            ) as last_date
        ")
            ->orderBy('import.id', 'asc')
            ->get();

        return $imports;
    }

    public static function get(int $id)
    {
        $import = Import::findOrFail($id);

        $import_detail = $import->details()
            ->where('is_current', true)
            ->first();

        if (!$import_detail) {
            throw new Exception('Aun no se ha ejecutado la importación');
        }

        if ($import_detail->is_active) {
            throw new Exception('Importación en curso');
        }

        $result = [
            'id' => $import->id,
            'key' => $import->key,
            'title' => $import->title,
            'status' => $import_detail->status,
            'progress' => $import_detail->progress,
            'date' => $import_detail->date,
            'time_elapsed' => $import_detail->time_elapsed,
            'log' => json_decode($import_detail->log),
            'summary' => json_decode($import_detail->summary),
        ];

        return $result;
    }

    public static function currently()
    {
        $import = Import::select([
            'import.id',
            'import.key',
            'import.title',
            'import_detail.status',
            'import_detail.progress',
            'import_detail.date',
            'import_detail.time_elapsed',
            'import_detail.log',
            'import_detail.summary',
        ])
            ->join('import_detail', 'import.id', 'import_detail.import_id')
            ->where('import_detail.is_current', true)
            ->where('import_detail.is_active', true)
            ->first();

        if ($import) {
            $import->log = json_decode($import->log);
            $import->summary = json_decode($import->summary);
        }

        return $import;
    }

    public static function history(int $id)
    {
        $import = Import::findOrFail($id);

        $import_details = $import->details()
            ->orderBy('date', 'desc')
            ->get()
            ->map(function ($import_detail) {
                return [
                    'id' => $import_detail->id,
                    'status' => $import_detail->status,
                    'date' => $import_detail->date,
                    'log' => json_decode($import_detail->log),
                ];
            });

        $result = [
            'id' => $import->id,
            'key' => $import->key,
            'title' => $import->title,
            'details' => $import_details,
        ];

        return $result;
    }

    public static function execute(string $key, Request $request)
    {
        User::authenticated([RolTenant::SECRETARY, RolTenant::ADMINISTRADOR]);

        ImportHelper::validateRequest($request);

        $file = $request->file('file');

        $exists = ImportDetail::select()
            ->where('is_active', true)
            ->exists();

        if ($exists) {
            throw new Exception('Ya existe una importación en curso');
        }

        $import = Import::select()
            ->where('key', $key)
            ->firstOrFail();

        $data = ImportHelper::extractData($file);

        // self::executeJob($import, $key, $data); // Usar para ejecutar en primer plano
        ImportJob::dispatch($import, $key, $data); // Usar para ejecutar en segundo plano

        return 'Importación iniciada';
    }

    public static function executeJob($import, $key, $data)
    {
        try {
            $now = Carbon::now();

            $import->details()
                ->where('is_current', true)
                ->update([
                    'is_current' => false,
                ]);

            $import_detail = $import->details()->create([
                'is_current' => true,
                'is_active' => true,
                'status' => 'pending',
                'progress' => 0,
                'date' => $now,
                'time_elapsed' => 0,
                'log' => json_encode(["$now | Importación iniciada"]),
            ]);

            $rows = ImportHelper::formatData($import, $import_detail, $data);

            switch ($key) {
                case 'staff':
                    $summary = self::importStaff($import_detail, $rows);
                    break;
                case 'study_programs':
                    $summary = self::importStudyProgram($import_detail, $rows);
                    break;
                case 'admissions':
                    break;
                case 'registrations':
                    $summary = self::importRegistration($import_detail, $rows);
                    break;
                case 'evaluations':
                    $summary = self::importEvaluation($import_detail, $rows);
                    break;
                default:
                    throw new Exception('Tipo no admitido');
            }

            $date = Carbon::parse($import_detail->date);
            $now = Carbon::now();

            $log = json_decode($import_detail->log);
            $log[] = "$now | Importación completada";

            $import_detail->update([
                'is_current' => true,
                'is_active' => false,
                'status' => 'completed',
                'progress' => 100,
                'time_elapsed' => $date->diffInMinutes($now),
                'log' => json_encode($log),
                'summary' => json_encode($summary),
            ]);
        } catch (Exception $e) {
            $date = Carbon::parse($import_detail->date);
            $now = Carbon::now();

            $log = json_decode($import_detail->log);
            $aux = $e->getMessage();
            $log[] = "$now | $aux";

            $import_detail->update([
                'is_current' => true,
                'is_active' => false,
                'status' => 'failed',
                'progress' => 100,
                'time_elapsed' => $date->diffInMinutes($now),
                'log' => json_encode($log),
            ]);

            logger($e->getMessage());
        }
    }

    public static function finish(Request $request)
    {
        $key = $request->input('key');

        $import = Import::select()
            ->where('key', $key)
            ->firstOrFail();

        $import_detail = ImportDetail::select()
            ->where('import_id', $import->id)
            ->where('is_active', true)
            ->first();

        if (!$import_detail) {
            throw new Exception('No se encontró el detalle de importación actual.');
        }

        $import_detail->update([
            'is_current' => false,
            'is_active' => false
        ]);

        return "Importación finalizada";
    }

    public static function finishAll()
    {
        $import_details = ImportDetail::select()
            ->where('is_active', true)
            ->get();

        foreach ($import_details as $detail) {
            $detail->update([
                'is_current' => false,
                'is_active' => false
            ]);
        }

        return "Importaciones finalizadas";
    }

    private static function importStaff($import_detail, $rows)
    {
        $total = count($rows);
        $tenPercent = ceil($total / 10);

        $totalPeriods = 0;
        $totalPersons = 0;
        $totalTeachers = 0;
        $totalUsers = 0;

        $log = json_decode($import_detail->log);

        foreach ($rows as $index => $row) {
            if ($index % $tenPercent == 0) {
                $progress = round(($index / $total) * 100);

                if ($progress) {
                    $date = Carbon::parse($import_detail->date);
                    $now = Carbon::now();

                    $log[] = "$now | $progress% procesado";

                    $import_detail->update([
                        'progress' => $progress,
                        'time_elapsed' => $date->diffInMinutes($now),
                        'log' => json_encode($log),
                    ]);
                }
            }

            $period = Period::select()
                ->withTrashed()
                ->where('name', $row->period)
                ->first();

            if ($period && $period->trashed()) {
                $period->restore();
            }

            if (!$period) {
                $period = Period::create([
                    'name' => $row->period,
                ]);

                $totalPeriods++;
            }

            $person = Person::select()
                ->withTrashed()
                ->where('document_number', $row->document_number)
                ->first();

            if ($person && $person->trashed()) {
                $person->restore();
            }

            if (!$person) {
                $person = Person::create([
                    'document_number' => $row->document_number,
                    'names' => $row->names,
                    'phone' => $row->phone,
                ]);

                $totalPersons++;
            }

            if ($row->type == 'DOCENTE') {
                $teacher = Teacher::select()
                    ->withTrashed()
                    ->where('person_id', $person->id)
                    ->first();

                if ($teacher) {
                    if ($teacher->trashed()) {
                        $teacher->restore();
                    }

                    $newRegistrationDate = Date::invertDateFormat($row->registration_date);

                    if ($newRegistrationDate > $teacher->registration_date) {
                        $teacher->update([
                            'registration_date' => $newRegistrationDate,
                        ]);
                    }
                }

                if (!$teacher) {
                    $workingCondition = WorkingCondition::select()
                        ->withTrashed()
                        ->where('name', $row->working_condition)
                        ->first();

                    if ($workingCondition && $workingCondition->trashed()) {
                        $workingCondition->restore();
                    }

                    if (!$workingCondition) {
                        $workingCondition = WorkingCondition::create([
                            'name' => $row->working_condition,
                        ]);
                    }

                    $teacher = Teacher::create([
                        'person_id' => $person->id,
                        'working_condition_id' => $workingCondition->id,
                        'registration_date' => Date::invertDateFormat($row->registration_date),
                    ]);

                    $totalTeachers++;
                }
            }

            $admittedTypes = ['SECRETARIO ACADÉMICO', 'DOCENTE'];
            $admittedUser = in_array($row->type, $admittedTypes);

            if ($admittedUser) {
                $user = User::select()
                    ->withTrashed()
                    ->where('person_id', $person->id)
                    ->first();

                if ($user) {
                    if ($user->email != $row->email) {
                        $log[] = "$now | Correo $row->email ya registrado para otro usuario en la fila $row->id";
                        continue;
                    }

                    if ($user->trashed()) {
                        $user->restore();

                        $user->update([
                            'email' => $row->email,
                            'password' => Hash::make($row->document_number)
                        ]);
                    }
                }

                if (!$user) {
                    $existsEmail = User::select()
                        ->where('email', $row->email)
                        ->first();

                    if ($existsEmail) {
                        $log[] = "$now | Correo $row->email ya registrado para otro usuario en la fila $row->id";
                        continue;
                    }

                    $user = User::create([
                        'person_id' => $person->id,
                        'email' => $row->email,
                        'password' => Hash::make($row->document_number),
                    ]);

                    $totalUsers++;

                    self::sendMail($row->names, $row->email, $row->document_number);
                }

                $rol = Rol::select()
                    ->where('name', $row->type)
                    ->first();

                if (!$user->roles->contains($rol)) {
                    $user->roles()->attach($rol->id);
                }
            }
        }

        $date = Carbon::parse($import_detail->date);
        $now = Carbon::now();

        $log[] = "$now | 100% procesado";

        $import_detail->update([
            'progress' => $progress,
            'time_elapsed' => $date->diffInMinutes($now),
            'log' => json_encode($log),
        ]);

        $summary = [
            'Total de periodos importados' => $totalPeriods,
            'Total de personas importadas' => $totalPersons,
            'Total de docentes importados' => $totalTeachers,
            'Total de usuarios importados' => $totalUsers,
        ];

        return $summary;
    }

    private static function importStudyProgram($import_detail, $rows)
    {
        $total = count($rows);
        $tenPercent = ceil($total / 10);

        $totalProductiveFamilies = 0;
        $totalStudyPrograms = 0;
        $totalStudyPlans = 0;

        $log = json_decode($import_detail->log);

        foreach ($rows as $index => $row) {
            if ($index % $tenPercent == 0) {
                $progress = round(($index / $total) * 100);

                if ($progress) {
                    $date = Carbon::parse($import_detail->date);
                    $now = Carbon::now();

                    $log[] = "$now | $progress% procesado";

                    $import_detail->update([
                        'progress' => $progress,
                        'time_elapsed' => $date->diffInMinutes($now),
                        'log' => json_encode($log),
                    ]);
                }
            }

            $productiveFamily = ProductiveFamily::select()
                ->withTrashed()
                ->where('name', $row->name_productive_family)
                ->first();

            if ($productiveFamily && $productiveFamily->trashed()) {
                $productiveFamily->restore();
            }

            if (!$productiveFamily) {
                $productiveFamily = ProductiveFamily::create([
                    'name' => $row->name_productive_family,
                ]);

                $totalProductiveFamilies++;
            }

            $studyProgram = StudyProgram::select()
                ->withTrashed()
                ->where('productive_family_id', $productiveFamily->id)
                ->where('name', $row->name_program)
                ->first();

            if ($studyProgram && $studyProgram->trashed()) {
                $studyProgram->restore();
            }

            if (!$studyProgram) {
                $studyProgram = StudyProgram::create([
                    'productive_family_id' => $productiveFamily->id,
                    'name' => $row->name_program,
                ]);

                $totalStudyPrograms++;
            }

            $studyPlan = StudyPlan::select()
                ->withTrashed()
                ->where('study_program_id', $studyProgram->id)
                ->where('name', $row->name_plan)
                ->first();

            if ($studyPlan && $studyPlan->trashed()) {
                $studyPlan->restore();
            }

            if (!$studyPlan) {
                $studyPlanType = StudyPlanType::select()
                    ->withTrashed()
                    ->where('name', $row->type)
                    ->first();

                if ($studyPlanType && $studyPlanType->trashed()) {
                    $studyPlanType->restore();
                }

                if (!$studyPlanType) {
                    $studyPlanType = StudyPlanType::create([
                        'name' => $row->type,
                    ]);
                }

                $studyPlan = StudyPlan::create([
                    'study_program_id' => $studyProgram->id,
                    'type_id' => $studyPlanType->id,
                    'name' => $row->name_plan,
                ]);

                $totalStudyPlans++;
            }
        }

        $date = Carbon::parse($import_detail->date);
        $now = Carbon::now();

        $log[] = "$now | 100% procesado";

        $import_detail->update([
            'progress' => $progress,
            'time_elapsed' => $date->diffInMinutes($now),
            'log' => json_encode($log),
        ]);

        $summary = [
            'Total de Familias Productivas importadas' => $totalProductiveFamilies,
            'Total de Programas de Estudio importados' => $totalStudyPrograms,
            'Total de Planes de Estudio importados' => $totalStudyPlans,
        ];

        return $summary;
    }

    private static function importRegistration($import_detail, $rows)
    {
        $total = count($rows);
        $tenPercent = ceil($total / 10);

        $totalCycles = 0;
        $totalPersons = 0;
        $totalStudents = 0;
        $totalEnrollments = 0;
        $totalUsers = 0;

        $studyPrograms = StudyProgram::all();
        $studyPlans = StudyPlan::all();

        $log = json_decode($import_detail->log);

        foreach ($rows as $index => $row) {
            if ($index % $tenPercent == 0) {
                $progress = round(($index / $total) * 100);

                if ($progress) {
                    $date = Carbon::parse($import_detail->date);
                    $now = Carbon::now();

                    $log[] = "$now | $progress% procesado";

                    $import_detail->update([
                        'progress' => $progress,
                        'time_elapsed' => $date->diffInMinutes($now),
                        'log' => json_encode($log),
                    ]);
                }
            }

            $now = Carbon::now();

            $period = Period::select()
                ->where('name', $row->period)
                ->first();

            if (!$period) {
                $log[] = "$now | Periodo $row->period no encontrado para la fila $row->id";
                continue;
            }

            $period->update([
                'is_current' => $row->status_period == 'SIN TERMINO',
            ]);

            $studyProgram = $studyPrograms
                ->where('name', $row->name_program)
                ->first();

            if (!$studyProgram) {
                $log[] = "$now | Programa de estudios $row->name_program no encontrado para la fila $row->id";
                continue;
            }

            $studyPlan = ReadjustmentHelper::getBestStudyPlanByStudyProgram($studyPlans, $studyProgram->id);

            $cycle = Cycle::select()
                ->withTrashed()
                ->where('name', $row->name_cycle)
                ->first();

            if ($cycle && $cycle->trashed()) {
                $cycle->restore();
            }

            if (!$cycle) {
                $lastOrder = Cycle::max('order');

                $cycle = Cycle::create([
                    'name' => $row->name_cycle,
                    'order' => $lastOrder ? $lastOrder + 1 : 1,
                ]);

                $totalCycles++;
            }

            $person = Person::select()
                ->withTrashed()
                ->where('document_number', $row->document_number)
                ->first();

            if ($person) {
                if ($person->trashed()) {
                    $person->restore();
                }

                $person->update([
                    'sex' => $row->sex,
                    'birth_date' => Date::invertDateFormat($row->birth_date),
                    'native_language' => $row->native_language,
                ]);
            }

            if (!$person) {
                $person = Person::create([
                    'document_number' => $row->document_number,
                    'names' => implode(' ', [
                        $row->last_name_one,
                        $row->last_name_two,
                        $row->name,
                    ]),
                    'phone' => $row->phone,
                    'sex' => $row->sex,
                    'birth_date' => Date::invertDateFormat($row->birth_date),
                    'native_language' => $row->native_language,
                ]);

                $totalPersons++;
            }

            $student = Student::select()
                ->withTrashed()
                ->where('person_id', $person->id)
                ->first();

            if ($student && $student->trashed()) {
                $student->restore();
            }

            if (!$student) {
                $student = Student::create([
                    'person_id' => $person->id,
                    'code' => null,
                ]);

                $totalStudents++;
            }

            $studentPlan = StudentPlan::select()
                ->withTrashed()
                ->where('student_id', $student->id)
                ->where('study_plan_id', $studyPlan->id)
                ->first();

            if ($studentPlan && $studentPlan->trashed()) {
                $studentPlan->restore();
            }

            if (!$studentPlan) {
                $studentPlan = StudentPlan::create([
                    'student_id' => $student->id,
                    'study_plan_id' => $studyPlan->id,
                    'registration_date' => Date::invertDateTimeFormat($row->registration_date),
                    'is_active' => $row->registration_status == 'ACTIVO',
                ]);
            }

            $enrollment = Enrollment::select()
                ->withTrashed()
                ->where('student_plan_id', $studentPlan->id)
                ->where('period_id', $period->id)
                ->where('cycle_id', $cycle->id)
                ->first();

            if ($enrollment && $enrollment->trashed()) {
                $enrollment->restore();
            }

            if (!$enrollment) {
                $enrollment = Enrollment::create([
                    'student_plan_id' => $studentPlan->id,
                    'type_id' => null,
                    'period_id' => $period->id,
                    'cycle_id' => $cycle->id,
                    'shift_id' => null,
                    'section_id' => null,
                    'is_approved' => null,
                    'registration_date' => Date::invertDateTimeFormat($row->registration_date),
                ]);

                $totalEnrollments++;
            }

            $user = User::select()
                ->withTrashed()
                ->where('person_id', $person->id)
                ->first();

            if ($user) {
                if ($user->email != $row->email) {
                    $log[] = "$now | Correo $row->email ya registrado para otro usuario en la fila $row->id";
                    continue;
                }

                if ($user->trashed()) {
                    $user->restore();

                    $user->update([
                        'email' => $row->email,
                        'password' => Hash::make($row->document_number)
                    ]);
                }
            }

            if (!$user) {
                $existsEmail = User::select()
                    ->where('email', $row->email)
                    ->first();

                if ($existsEmail) {
                    $log[] = "$now | Correo $row->email ya registrado para otro usuario en la fila $row->id";
                    continue;
                }

                $user = User::create([
                    'person_id' => $person->id,
                    'email' => $row->email,
                    'password' => Hash::make($row->document_number),
                ]);

                $totalUsers++;

                self::sendMail($person->names, $row->email, $row->document_number);
            }

            $rol = Rol::select()
                ->where('name', 'ESTUDIANTE')
                ->first();

            if (!$user->roles->contains($rol)) {
                $user->roles()->attach($rol->id);
            }
        }

        $date = Carbon::parse($import_detail->date);
        $now = Carbon::now();

        $log[] = "$now | 100% procesado";

        $import_detail->update([
            'progress' => $progress,
            'time_elapsed' => $date->diffInMinutes($now),
            'log' => json_encode($log),
        ]);

        $summary = [
            'Total de ciclos importados' => $totalCycles,
            'Total de personas importadas' => $totalPersons,
            'Total de estudiantes importados' => $totalStudents,
            'Total de matriculas importadas' => $totalEnrollments,
            'Total de usuarios importados' => $totalUsers,
        ];

        return $summary;
    }

    private static function importEvaluation($import_detail, $rows)
    {
        $total = count($rows);
        $tenPercent = ceil($total / 10);

        $totalCourses = 0;
        $totalSections = 0;
        $totalShifts = 0;
        $totalStudyPlanDetails = 0;
        $totalClassrooms = 0;
        $totalParticipants = 0;
        $totalParticipantsUpdated = 0;

        $periods = Period::all();
        $studyPrograms = StudyProgram::all();
        $studyPlans = StudyPlan::all();
        $cycles = Cycle::all();
        $persons = Person::all();
        $students = Student::all();

        $log = json_decode($import_detail->log);

        foreach ($rows as $index => $row) {
            if ($index % $tenPercent == 0) {
                $progress = round(($index / $total) * 100);

                if ($progress) {
                    $date = Carbon::parse($import_detail->date);
                    $now = Carbon::now();

                    $log[] = "$now | $progress% procesado";

                    $import_detail->update([
                        'progress' => $progress,
                        'time_elapsed' => $date->diffInMinutes($now),
                        'log' => json_encode($log),
                    ]);
                }
            }

            $now = Carbon::now();

            $period = $periods
                ->where('name', $row->period)
                ->first();

            if (!$period) {
                $log[] = "$now | Periodo $row->period no encontrado para la fila $row->id";
                continue;
            }

            $studyProgram = $studyPrograms
                ->where('name', $row->name_program)
                ->first();

            if (!$studyProgram) {
                $log[] = "$now | Programa de estudios $row->name_program no encontrado para la fila $row->id";
                continue;
            }

            $studyPlan = ReadjustmentHelper::getBestStudyPlanByStudyProgram($studyPlans, $studyProgram->id);

            $cycle = $cycles
                ->where('name', $row->name_cycle)
                ->first();

            if (!$cycle) {
                $log[] = "$now |Ciclo $row->name_cycle no encontrado para la fila $row->id";
                continue;
            }

            $person = $persons
                ->where('document_number', $row->document_number)
                ->first();

            $student = null;

            if ($person) {
                $student = $students
                    ->where('person_id', $person->id)
                    ->first();
            }

            if (!$student) {
                $log[] = "$now | Estudiante con documento $row->document_number no encontrado para la fila $row->id";
                continue;
            }

            $course = Course::select()
                ->withTrashed()
                ->where('name', $row->name_course)
                ->first();

            if ($course && $course->trashed()) {
                $course->restore();
            }

            if (!$course) {
                $course = Course::create([
                    'name' => $row->name_course,
                ]);

                $totalCourses++;
            }

            $section = Section::select()
                ->where('name', $row->name_section)
                ->first();

            if (!$section) {
                $section = Section::create([
                    'name' => $row->name_section,
                ]);

                $totalSections++;
            }

            $shift = Shift::select()
                ->where('name', $row->name_shift)
                ->first();

            if (!$shift) {
                $shift = Shift::create([
                    'name' => $row->name_shift,
                ]);

                $totalShifts++;
            }

            $studyPlanDetail = StudyPlanDetail::select()
                ->withTrashed()
                ->where('study_plan_id', $studyPlan->id)
                ->where('cycle_id', $cycle->id)
                ->where('course_id', $course->id)
                ->first();

            if ($studyPlanDetail && $studyPlanDetail->trashed()) {
                $studyPlanDetail->restore();
            }

            if (!$studyPlanDetail) {
                $studyPlanDetail = StudyPlanDetail::create([
                    'study_plan_id' => $studyPlan->id,
                    'cycle_id' => $cycle->id,
                    'course_id' => $course->id,
                ]);

                $totalStudyPlanDetails++;
            }

            $classroom = Classroom::select()
                ->withTrashed()
                ->where('period_id', $period->id)
                ->where('study_plan_detail_id', $studyPlanDetail->id)
                ->where('shift_id', $shift->id)
                ->where('section_id', $section->id)
                ->first();

            if ($classroom && $classroom->trashed()) {
                $classroom->restore();
            }

            if (!$classroom) {
                $classroom = Classroom::create([
                    'period_id' => $period->id,
                    'study_plan_detail_id' => $studyPlanDetail->id,
                    'shift_id' => $shift->id,
                    'section_id' => $section->id,
                ]);

                $totalClassrooms++;
            }

            $participant = Participant::select()
                ->withTrashed()
                ->where('student_id', $student->id)
                ->where('classroom_id', $classroom->id)
                ->first();

            $score = is_numeric($row->score) ? (float) $row->score : 0.00;

            if ($participant) {
                if ($participant->trashed()) {
                    $participant->restore();
                }

                if ($participant->score != $score) {
                    $participant->update([
                        'score' => $score,
                    ]);

                    $totalParticipantsUpdated++;
                }
            }

            if (!$participant) {
                $participant = Participant::create([
                    'student_id' => $student->id,
                    'classroom_id' => $classroom->id,
                    'score' => $score,
                ]);

                $totalParticipants++;
            }
        }

        $date = Carbon::parse($import_detail->date);
        $now = Carbon::now();

        $log[] = "$now | 100% procesado";

        $import_detail->update([
            'progress' => $progress,
            'time_elapsed' => $date->diffInMinutes($now),
            'log' => json_encode($log),
        ]);

        $summary = [
            'Total de cursos importados' => $totalCourses,
            'Total de secciones importadas' => $totalSections,
            'Total de turnos importados' => $totalShifts,
            'Total de detalles de plan de estudio importados' => $totalStudyPlanDetails,
            'Total de clases importadas' => $totalClassrooms,
            'Total de participantes importados' => $totalParticipants,
            'Total de participantes actualizados' => $totalParticipantsUpdated,
        ];

        return $summary;
    }

    private static function sendMail($name, $email, $password)
    {
        $domain = AdminSystemConfigurationHelper::getDomain();
        $subDomain = AdminSystemConfigurationHelper::getSubDomain();

        $institutionName = SystemConfigurationHelper::getInstitutionName();
        $institutionUrl = "https://$subDomain.$domain";

        $body = EmailBodyTemplate::credentials;
        $body = str_replace('{{institutionName}}', $institutionName, $body);
        $body = str_replace('{{institutionUrl}}', $institutionUrl, $body);
        $body = str_replace('{{name}}', $name, $body);
        $body = str_replace('{{email}}', $email, $body);
        $body = str_replace('{{password}}', $password, $body);

        $data = (object) [
            'subject' => 'Credenciales de acceso',
            'body' => $body,
            'to' => $email,
        ];

        MailerService::send($data);
    }
}
