<?php

namespace Modules\Tenant\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StudentPlan extends Model
{
    use SoftDeletes;

    protected $table = 'student_plan';

    protected $fillable = [
        'id',
        'student_id',
        'study_plan_id',
        'registration_date',
        'is_active',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function studyPlan()
    {
        return $this->belongsTo(StudyPlan::class, 'study_plan_id');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'student_plan_id');
    }
}
