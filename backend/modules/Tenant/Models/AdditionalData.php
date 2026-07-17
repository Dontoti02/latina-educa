<?php

namespace Modules\Tenant\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AdditionalData extends Model
{
    use SoftDeletes;

    protected $table = 'person_additional_data';

    protected $fillable = [
        'id',
        'person_id',
        'permanent_address',
        'current_address',
        'country',
        'department',
        'province',
        'district',
        'civil_status',
        'cell_phone',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    public function person()
    {
        return $this->belongsTo(Person::class, 'person_id');
    }
}
