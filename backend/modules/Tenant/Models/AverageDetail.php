<?php

namespace Modules\Tenant\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AverageDetail extends Model
{
    use SoftDeletes;

    protected $table = 'average_detail';

    protected $fillable = [
        'id',
        'student_id',
        'content_group_id',
        'evaluation_group_id',
        'score',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function contentGroup()
    {
        return $this->belongsTo(ContentGroup::class, 'content_group_id');
    }

    public function evaluationGroup()
    {
        return $this->belongsTo(EvaluationGroup::class, 'evaluation_group_id');
    }
}
