<?php

namespace Modules\Admin\Repositories;

use Illuminate\Support\Facades\DB;
use Modules\Admin\Helpers\ReadjustmentHelper;
use Modules\Admin\Queries\ReadjustmentQuery;

class ReadjustmentRepository
{
    public static function run()
    {
        $log = [];

        $tenants = DB::table('tenant')->get();

        foreach ($tenants as $tenant) {
            $databaseName = $tenant->tenancy_db_name;

            $databaseExists = DB::selectOne('
                SELECT SCHEMA_NAME 
                FROM INFORMATION_SCHEMA.SCHEMATA 
                WHERE SCHEMA_NAME = ?
            ',  [$databaseName]);

            if (!$databaseExists) {
                continue;
            }

            $log[] = "$databaseName | Iniciando reajuste...";

            $result = self::readjustment($databaseName);

            $log = array_merge($log, $result);

            $log[] = "$databaseName | Reajuste finalizado.";
        }

        return $log;
    }

    private static function readjustment($databaseName)
    {
        $log = [];

        DB::statement('SET FOREIGN_KEY_CHECKS = 0;');

        $existsPP = DB::selectOne('
            SELECT TABLE_NAME
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        ', [$databaseName, 'program_plan']);

        if ($existsPP) {
            $resultPP = self::readjustmentProgramsAndPlans($databaseName);
            $log = array_merge($log, $resultPP);
        }

        $existsSPD = DB::selectOne('
            SELECT TABLE_NAME
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        ', [$databaseName, 'study_plan_detail']);

        if (!$existsSPD) {
            $resultCTC = self::readjustmentCoursesAndTeachersAndClassrooms($databaseName);
            $log = array_merge($log, $resultCTC);
        }

        $existsP = DB::selectOne('
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
        ', [$databaseName, 'period', 'status']);

        if ($existsP) {
            $resultP = self::readjustmentPeriods($databaseName);
            $log = array_merge($log, $resultP);
        }

        $existsSP = DB::selectOne('
            SELECT TABLE_NAME
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        ', [$databaseName, 'student_plan']);

        if (!$existsSP) {
            $resultSE = self::readjustmentStudentsAndEnrollments($databaseName);
            $log = array_merge($log, $resultSE);
        }

        $existsPa = DB::selectOne('
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
        ', [$databaseName, 'participant', 'person_id']);

        if ($existsPa) {
            $resultPa = self::readjustmentParticipants($databaseName);
            $log = array_merge($log, $resultPa);
        }

        $existsA = DB::selectOne('
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
        ', [$databaseName, 'assistance', 'person_id']);

        if ($existsA) {
            $resultA = self::readjustmentAssistances($databaseName);
            $log = array_merge($log, $resultA);
        }

        $existsAn = DB::selectOne('
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
        ', [$databaseName, 'answer', 'person_id']);

        if ($existsAn) {
            $resultAn = self::readjustmentAnswers($databaseName);
            $log = array_merge($log, $resultAn);
        }

        $existsFP = DB::table("$databaseName.option")
            ->where('name_url', 'ProductiveFamily')
            ->exists();

        if (!$existsFP) {
            $resultO = self::readjustmentOptions($databaseName);
            $log = array_merge($log, $resultO);
        }

        $readjustmentCycles = DB::selectOne('
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
        ', [$databaseName, 'cycle', 'order']);

        if (!$readjustmentCycles) {
            $resultReadjustmentCycles = self::readjustmentCycles($databaseName);
            $log = array_merge($log, $resultReadjustmentCycles);
        }

        DB::statement('SET FOREIGN_KEY_CHECKS = 1;');

        return $log;
    }

    private static function readjustmentProgramsAndPlans($databaseName)
    {
        $log = [];

        $log[] = "$databaseName | Procesando programas y planes de estudios...";

        $studyPrograms = DB::table("$databaseName.study_program")->get();
        $studyPlans = DB::table("$databaseName.study_plan")->get();
        $programsPlans = DB::table("$databaseName.program_plan")->get();

        $studyPlanTypeLastId = 0;
        $studyPlanLastId = 0;

        $createdStudyPlanTypes = [];
        $createdStudyPlans = [];
        foreach ($programsPlans as $programPlan) {
            $studyProgram = $studyPrograms
                ->where('id', $programPlan->study_program_id)
                ->first();

            $studyPlan = $studyPlans
                ->where('id', $programPlan->study_plan_id)
                ->first();

            $studyPlanTypeName = trim(preg_replace('/\s+/', ' ', $studyPlan->type));
            $studyPlanName = trim(preg_replace('/\s+/', ' ', $studyPlan->name));

            $existsStudyPlanType = collect($createdStudyPlanTypes)
                ->where('name', $studyPlanTypeName)
                ->first();

            if (!$existsStudyPlanType) {
                $studyPlanTypeLastId++;

                $existsStudyPlanType = [
                    'id' => $studyPlanTypeLastId,
                    'name' => $studyPlanTypeName,
                ];

                $createdStudyPlanTypes[] = $existsStudyPlanType;
            }

            $existsStudyPlan = collect($createdStudyPlans)
                ->where('study_program_id', $studyProgram->id)
                ->where('name', $studyPlanName)
                ->first();

            if (!$existsStudyPlan) {
                $studyPlanLastId++;

                $createdStudyPlans[] = [
                    'id' => $studyPlanLastId,
                    'study_program_id' => $studyProgram->id,
                    'type_id' => $existsStudyPlanType['id'],
                    'name' => $studyPlanName,
                    'year' => null,
                    'is_active' => true,
                ];
            }
        }

        $data = [
            'createdStudyPlanTypes' => $createdStudyPlanTypes,
            'createdStudyPlans' => $createdStudyPlans,
        ];

        $log[] = "$databaseName | Programas y planes de estudios procesados.";

        $result = ReadjustmentQuery::programsAndPlans($databaseName, $data);

        $log = array_merge($log, $result);

        return $log;
    }

    private static function readjustmentCoursesAndTeachersAndClassrooms($databaseName)
    {
        $log = [];

        $log[] = "$databaseName | Procesando ciclos, cursos, docentes y clases...";

        $studyPlans = DB::table("$databaseName.study_plan")->get();
        $cycles = DB::table("$databaseName.cycle")->get();
        $courses = DB::table("$databaseName.course")->get();
        $teachers = DB::table("$databaseName.teacher")->get();
        $classrooms = DB::table("$databaseName.classroom")->get();

        $staffsWorkingConditions = DB::table("$databaseName.staff")
            ->select('working_condition')
            ->distinct()
            ->pluck('working_condition')
            ->toArray();

        $workingConditionLastId = 0;
        $createdWorkingConditions = [];
        foreach ($staffsWorkingConditions as $staffsWorkingCondition) {
            $workingConditionLastId++;

            $createdWorkingConditions[] = [
                'id' => $workingConditionLastId,
                'name' => $staffsWorkingCondition,
            ];
        }

        $staffsTeachers = DB::table("$databaseName.staff")
            ->whereRaw("$databaseName.staff.id = (
                SELECT s.id
                FROM $databaseName.staff s
                WHERE
                    s.person_id = $databaseName.staff.person_id AND
                    s.type = 'DOCENTE'
                ORDER BY
                    s.period_id DESC
                LIMIT 1
            )")
            ->get();

        $teacherLastId = 0;
        $createdTeachers = [];
        foreach ($staffsTeachers as $staffTeacher) {
            $workingCondition = collect($createdWorkingConditions)
                ->where('name', $staffTeacher->working_condition)
                ->first();

            $existsTeacher = collect($createdTeachers)
                ->where('person_id', $staffTeacher->person_id)
                ->first();

            if (!$existsTeacher) {
                $teacherLastId++;

                $existsTeacher = [
                    'id' => $teacherLastId,
                    'person_id' => $staffTeacher->person_id,
                    'working_condition_id' => $workingCondition['id'],
                    'study_program_id' => null,
                    'registration_date' => $staffTeacher->registration_date,
                    'resolution_number' => null,
                ];

                $createdTeachers[] = $existsTeacher;
            }
        }

        $courseLastId = 0;
        $studyPlanDetailLastId = 0;
        $createdCourses = [];
        $createdStudyPlanDetails = [];
        $updatedClassrooms = [];
        foreach ($classrooms as $classroom) {
            $course = $courses
                ->where('id', $classroom->course_id)
                ->first();

            $studyPlan = ReadjustmentHelper::getBestStudyPlanByStudyProgram($studyPlans, $course->study_program_id);

            $cycle = $cycles
                ->where('id', $course->cycle_id)
                ->first();

            $courseName = trim(preg_replace('/\s+/', ' ', $course->name));

            $existsCourse = collect($createdCourses)
                ->where('name', $courseName)
                ->first();

            if (!$existsCourse) {
                $courseLastId++;

                $existsCourse = [
                    'id' => $courseLastId,
                    'study_program_id' => null,
                    'module_id' => null,
                    'type_id' => null,
                    'code' => null,
                    'name' => $courseName,
                    'year' => null,
                    'credits' => null,
                    'hours' => null,
                    'description' => null,
                    'is_active' => true,
                ];

                $createdCourses[] = $existsCourse;
            }

            $existsStudyPlanDetail = collect($createdStudyPlanDetails)
                ->where('study_plan_id', $studyPlan->id)
                ->where('cycle_id', $cycle->id)
                ->where('course_id', $existsCourse['id'])
                ->first();

            if (!$existsStudyPlanDetail) {
                $studyPlanDetailLastId++;

                $existsStudyPlanDetail = [
                    'id' => $studyPlanDetailLastId,
                    'study_plan_id' => $studyPlan->id,
                    'cycle_id' => $cycle->id,
                    'course_id' => $existsCourse['id'],
                ];

                $createdStudyPlanDetails[] = $existsStudyPlanDetail;
            }

            $teacher = $teachers
                ->where('classroom_id', $classroom->id)
                ->first();

            $findTeacherId = $teacher
                ? collect($createdTeachers)
                    ->where('person_id', $teacher->person_id)
                    ->first()['id']
                : null;

            $updatedClassrooms[] = [
                'id' => $classroom->id,
                'study_plan_detail_id' => $existsStudyPlanDetail['id'],
                'teacher_id' => $findTeacherId,
            ];
        }

        $data = [
            'createdCourses' => $createdCourses,
            'createdStudyPlanDetails' => $createdStudyPlanDetails,
            'createdWorkingConditions' => $createdWorkingConditions,
            'createdTeachers' => $createdTeachers,
            'updatedClassrooms' => $updatedClassrooms,
        ];

        $log[] = "$databaseName | Ciclos, cursos, docentes y clases procesados.";

        $result = ReadjustmentQuery::coursesAndTeachersAndClassrooms($databaseName, $data);

        $log = array_merge($log, $result);

        return $log;
    }

    private static function readjustmentPeriods($databaseName)
    {
        $log = [];

        $log[] = "$databaseName | Procesando periodos...";

        $periods = DB::table("$databaseName.period")->get();

        $updatedPeriods = [];
        foreach ($periods as $period) {
            $updatedPeriods[] = [
                'id' => $period->id,
                'is_current' => $period->status == 'SIN TERMINO',
            ];
        }

        $data = [
            'updatedPeriods' => $updatedPeriods,
        ];

        $log[] = "$databaseName | Periodos procesados.";

        $result = ReadjustmentQuery::periods($databaseName, $data);

        $log = array_merge($log, $result);

        return $log;
    }

    private static function readjustmentStudentsAndEnrollments($databaseName)
    {
        $log = [];

        $log[] = "$databaseName | Procesando estudiantes y matriculas...";

        $studyPlans = DB::table("$databaseName.study_plan")->get();

        $oldStudents = DB::table("$databaseName.student")
            ->select()
            ->orderBy('person_id', 'asc')
            ->orderBy('period_id', 'desc')
            ->get();

        $oldEnrollments = DB::table("$databaseName.enrollment")->get();

        $studentLastId = 0;
        $studentPlanLastId = 0;
        $enrollmentLastId = 0;

        $createdStudents = [];
        $createdStudentPlans = [];
        $createdEnrollments = [];
        foreach ($oldStudents as $oldStudent) {
            $student = collect($createdStudents)
                ->where('person_id', $oldStudent->person_id)
                ->first();

            if (!$student) {
                $studentLastId++;

                $student = [
                    'id' => $studentLastId,
                    'person_id' => $oldStudent->person_id,
                    'code' => null,
                ];

                $createdStudents[] = $student;
            }

            $studyPlan = ReadjustmentHelper::getBestStudyPlanByStudyProgram($studyPlans, $oldStudent->study_program_id);

            $studentPlan = collect($createdStudentPlans)
                ->where('student_id', $student['id'])
                ->where('study_plan_id', $studyPlan->id)
                ->first();

            if (!$studentPlan) {
                $studentPlanLastId++;

                $studentPlan = [
                    'id' => $studentPlanLastId,
                    'student_id' => $student['id'],
                    'study_plan_id' => $studyPlan->id,
                    'registration_date' => $oldStudent->registration_date,
                    'is_active' => $oldStudent->status == 'ACTIVO',
                ];

                $createdStudentPlans[] = $studentPlan;
            }

            $enrollment = collect($createdEnrollments)
                ->where('student_plan_id', $studentPlan['id'])
                ->where('period_id', $oldStudent->period_id)
                ->first();

            if (!$enrollment) {
                $enrollmentLastId++;

                $enrollment = [
                    'id' => $enrollmentLastId,
                    'student_plan_id' => $studentPlan['id'],
                    'type_id' => null,
                    'period_id' => $oldStudent->period_id,
                    'cycle_id' => $oldStudent->cycle_id,
                    'shift_id' => null,
                    'section_id' => null,
                    'is_approved' => null,
                    'registration_date' => $oldStudent->registration_date,

                    'observations' => null,
                    'is_full_payment' => null,

                    'scale_id' => null,
                    'scale_authorization_document_type' => null,
                    'scale_authorization_document_number' => null,
                    'scale_authorization_full_names' => null,
                ];

                $oldEnrollment = $oldEnrollments
                    ->where('person_id', $oldStudent->person_id)
                    ->where('study_program_id', $oldStudent->study_program_id)
                    ->where('period_id', $oldStudent->period_id)
                    ->first();

                if ($oldEnrollment) {
                    $enrollment['shift_id'] = $oldEnrollment->shift_id;
                    $enrollment['section_id'] = $oldEnrollment->section_id;
                    $enrollment['registration_date'] = $oldEnrollment->registration_date;

                    $enrollment['observations'] = $oldEnrollment->observations;
                    $enrollment['is_full_payment'] = $oldEnrollment->is_full_payment;

                    $enrollment['scale_id'] = $oldEnrollment->scale_id;
                    $enrollment['scale_authorization_document_type'] = $oldEnrollment->scale_authorization_document_type;
                    $enrollment['scale_authorization_document_number'] = $oldEnrollment->scale_authorization_document_number;
                    $enrollment['scale_authorization_full_names'] = $oldEnrollment->scale_authorization_full_names;
                }

                $createdEnrollments[] = $enrollment;
            }
        }

        $data = [
            'createdStudents' => $createdStudents,
            'createdStudentPlans' => $createdStudentPlans,
            'createdEnrollments' => $createdEnrollments,
        ];

        $log[] = "$databaseName | Estudiantes y matriculas procesadas.";

        $result = ReadjustmentQuery::studentsAndEnrollments($databaseName, $data);

        $log = array_merge($log, $result);

        return $log;
    }

    private static function readjustmentParticipants($databaseName)
    {
        $log = [];

        $log[] = "$databaseName | Procesando participantes...";

        $students = DB::table("$databaseName.student")->get();
        $participants = DB::table("$databaseName.participant")->get();

        $createdParticipants = [];
        foreach ($participants as $participant) {
            $student = $students
                ->where('person_id', $participant->person_id)
                ->first();

            $createdParticipants[] = [
                'student_id' => $student->id,
                'classroom_id' => $participant->classroom_id,
            ];
        }

        $data = [
            'createdParticipants' => $createdParticipants,
        ];

        $log[] = "$databaseName | Participantes procesados.";

        $result = ReadjustmentQuery::participants($databaseName, $data);

        $log = array_merge($log, $result);

        return $log;
    }

    private static function readjustmentAssistances($databaseName)
    {
        $log = [];

        $log[] = "$databaseName | Procesando asistencias...";

        $students = DB::table("$databaseName.student")->get();
        $assistances = DB::table("$databaseName.assistance")->get();

        $createdAssistances = [];
        foreach ($assistances as $assistance) {
            $student = $students
                ->where('person_id', $assistance->person_id)
                ->first();

            $createdAssistances[] = [
                'student_id' => $student->id,
                'classroom_id' => $assistance->classroom_id,
                'status' => $assistance->status,
                'date' => $assistance->date,
                'reason' => $assistance->reason,
            ];
        }

        $data = [
            'createdAssistances' => $createdAssistances,
        ];

        $log[] = "$databaseName | Asistencias procesadas.";

        $result = ReadjustmentQuery::assistances($databaseName, $data);

        $log = array_merge($log, $result);

        return $log;
    }

    private static function readjustmentAnswers($databaseName)
    {
        $log = [];

        $log[] = "$databaseName | Procesando respuestas...";

        $students = DB::table("$databaseName.student")->get();
        $answers = DB::table("$databaseName.answer")->get();

        $createdAnswers = [];
        foreach ($answers as $answer) {
            $student = $students
                ->where('person_id', $answer->person_id)
                ->first();

            $createdAnswers[] = [
                'student_id' => $student->id,
                'content_id' => $answer->content_id,
                'status' => $answer->status,
                'score' => $answer->score,
            ];
        }

        $data = [
            'createdAnswers' => $createdAnswers,
        ];

        $log[] = "$databaseName | Respuestas procesadas.";

        $result = ReadjustmentQuery::answers($databaseName, $data);

        $log = array_merge($log, $result);

        return $log;
    }

    private static function readjustmentOptions($databaseName)
    {
        $log = [];

        $log[] = "$databaseName | Procesando opciones...";

        $menu_id_principal = 1;
        $menu_id_aula_virtual = 2;
        $menu_id_preferencias = 3;
        $menu_id_configuracion = 4;
        $menu_id_acceso_rapido = 5;
        $menu_id_procesos_academicos = 6;
        $menu_id_capacitaciones = 7;
        $menu_id_tesoreria = 8;
        $menu_id_bolsa_laboral = 9;

        $rol_id_secretario_academico = 1;
        $rol_id_docente = 2;
        $rol_id_estudiante = 3;
        $rol_id_administrador = 4;
        $rol_id_coordinador_de_capacitaciones = 5;
        $rol_id_docente_de_capacitaciones = 6;
        $rol_id_estudiante_de_capacitaciones = 7;
        $rol_id_empresa = 8;

        $options_procesos_academicos = [
            [
                'name' => 'Familia productiva',
                'name_url' => 'ProductiveFamily',
                'roles' => [$rol_id_secretario_academico],
            ],
            [
                'name' => 'Programa de estudio',
                'name_url' => 'StudyProgram',
                'roles' => [$rol_id_secretario_academico],
            ],
            [
                'name' => 'Tipos de planes de estudio',
                'name_url' => 'StudyPlanType',
                'roles' => [$rol_id_secretario_academico],
            ],
            [
                'name' => 'Planes de estudio',
                'name_url' => 'StudyPlan',
                'roles' => [$rol_id_secretario_academico],
            ],
            [
                'name' => 'Ciclos',
                'name_url' => 'Cycle',
                'roles' => [$rol_id_secretario_academico],
            ],
            [
                'name' => 'Tipos de módulos',
                'name_url' => 'ModuleType',
                'roles' => [$rol_id_secretario_academico],
            ],
            [
                'name' => 'Módulos',
                'name_url' => 'Module',
                'roles' => [$rol_id_secretario_academico],
            ],
            [
                'name' => 'Tipos de cursos',
                'name_url' => 'CourseType',
                'roles' => [$rol_id_secretario_academico],
            ],
            [
                'name' => 'Cursos',
                'name_url' => 'Course',
                'roles' => [$rol_id_secretario_academico],
            ],
            [
                'name' => 'Periodos',
                'name_url' => 'Period',
                'roles' => [$rol_id_secretario_academico],
            ],
            [
                'name' => 'Turnos',
                'name_url' => 'Shift',
                'roles' => [$rol_id_secretario_academico],
            ],
            [
                'name' => 'Secciones',
                'name_url' => 'Section',
                'roles' => [$rol_id_secretario_academico],
            ],
            [
                'name' => 'Clases',
                'name_url' => 'Classroom',
                'roles' => [$rol_id_secretario_academico],
            ],
        ];

        $options_preferencias = [
            [
                'name' => 'Condiciones laborales',
                'name_url' => 'WorkingCondition',
                'roles' => [$rol_id_secretario_academico],
            ],
            [
                'name' => 'Docentes',
                'name_url' => 'Teacher',
                'roles' => [$rol_id_secretario_academico],
            ],
        ];

        $menus = [
            $menu_id_preferencias => $options_preferencias,
            $menu_id_procesos_academicos => $options_procesos_academicos
        ];

        foreach ($menus as $menu_id => $menu_options) {
            foreach ($menu_options as $option) {
                $option_id = DB::table("$databaseName.option")->insertGetId([
                    'menu_id' => $menu_id,
                    'name' => $option['name'],
                    'name_url' => $option['name_url'],
                    'is_visible' => isset($option['is_visible']) ? $option['is_visible'] : 1,
                    'created_at' => now(),
                ]);

                $rol_options = [];
                foreach ($option['roles'] as $role_id) {
                    $rol_options[] = [
                        'rol_id' => $role_id,
                        'option_id' => $option_id,
                    ];
                }

                DB::table("$databaseName.rol_option")->insert($rol_options);
            }
        }

        $options_delete = ['Curriculum', 'AcademicPeriods'];

        DB::table("$databaseName.option")
            ->whereIn('name_url', $options_delete)
            ->delete();

        $log[] = "$databaseName | Opciones procesadas.";

        return $log;
    }

    private static function readjustmentCycles($databaseName)
    {
        $log = [];

        $log[] = "$databaseName | Procesando ciclos...";

        $cycles = DB::table("$databaseName.cycle")
            ->orderBy('name', 'asc')
            ->get();

        $updatedCycles = [];
        foreach ($cycles as $index => $cycle) {
            $updatedCycles[] = [
                'id' => $cycle->id,
                'order' => $index + 1,
            ];
        }

        $data = [
            'updatedCycles' => $updatedCycles,
        ];

        $log[] = "$databaseName | Ciclos procesados.";

        $result = ReadjustmentQuery::cycles($databaseName, $data);

        $log = array_merge($log, $result);

        return $log;
    }
}
