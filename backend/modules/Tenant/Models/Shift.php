<?php

namespace Modules\Tenant\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Shift extends Model
{
    use SoftDeletes;

    protected $table = 'shift';

    protected $fillable = [
        'id',
        'name',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function classrooms(): HasMany
    {
        return $this->hasMany(Classroom::class, 'shift_id');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class, 'shift_id');
    }
}
