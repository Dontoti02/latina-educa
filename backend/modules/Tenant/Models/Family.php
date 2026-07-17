<?php

namespace Modules\Tenant\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Family extends Model
{
    use SoftDeletes;

    protected $table = 'family';

    protected $fillable = [
        'id',
        'person_id',
        'document_type',
        'document_number',
        'full_names',
        'phone',
        'cell_phone',
        'email',
        'address',
        'occupation',
        'relationship',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function person()
    {
        return $this->belongsTo(Person::class, 'person_id');
    }
}
