<?php

namespace Modules\Tenant\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use SoftDeletes;

    protected $table = 'student';

    protected $fillable = [
        'id',
        'person_id',
        'code',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'person_id');
    }

    public function studentPlans(): HasMany
    {
        return $this->hasMany(StudentPlan::class, 'student_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class, 'student_id');
    }

    public function assistances(): HasMany
    {
        return $this->hasMany(Assistance::class, 'student_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(Answer::class, 'student_id');
    }

    public function averages()
    {
        return $this->hasMany(Average::class, 'student_id');
    }

    public function averageDetails()
    {
        return $this->hasMany(AverageDetail::class, 'student_id');
    }
}
