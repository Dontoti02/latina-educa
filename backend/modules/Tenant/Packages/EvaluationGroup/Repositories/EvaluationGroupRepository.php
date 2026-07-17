<?php

namespace Modules\Tenant\Packages\EvaluationGroup\Repositories;

use Exception;
use Illuminate\Http\Request;
use Modules\Tenant\Packages\Classroom\Helpers\ClassroomHelper;
use Modules\Tenant\Packages\EvaluationGroup\Helpers\EvaluationGroupHelper;
use Modules\Tenant\Models\Classroom;
use Modules\Tenant\Models\EvaluationGroup;

class EvaluationGroupRepository
{
    public static function list(int $classroom_id)
    {
        $classroom = Classroom::findOrFail($classroom_id);

        $evaluation_groups = $classroom->evaluationGroups()
            ->select('id', 'title', 'weight')
            ->get();

        return $evaluation_groups;
    }

    public static function set(Request $request)
    {
        EvaluationGroupHelper::validateRequest($request);
        EvaluationGroupHelper::validateWeight($request);
        ClassroomHelper::validateAccess($request->classroom_id, 'teacher');
        ClassroomHelper::validatePeriod($request->classroom_id);

        if ($request->filled('delete')) {
            $evaluation_groups = EvaluationGroup::select()
                ->whereIn('id', $request->delete)
                ->get();

            foreach ($evaluation_groups as $evaluation_group) {
                if ($evaluation_group->contents()->exists()) {
                    throw new Exception("No se puede eliminar el grupo de evaluación ($evaluation_group->title) porque tiene evaluaciones asociadas");
                }

                $evaluation_group->delete();
            }
        }

        if ($request->filled('update')) {
            foreach ($request->update as $item) {
                EvaluationGroupHelper::validateTitle($request->classroom_id, $item['title'], $item['id']);

                EvaluationGroup::find($item['id'])
                    ->update([
                        'title' => $item['title'],
                        'weight' => $item['weight']
                    ]);
            }
        }

        if ($request->filled('create')) {
            foreach ($request->create as $item) {
                EvaluationGroupHelper::validateTitle($request->classroom_id, $item['title']);

                EvaluationGroup::create([
                    'classroom_id' => $request->classroom_id,
                    'title' => $item['title'],
                    'weight' => $item['weight'],
                ]);
            }
        }

        $result = self::list($request->classroom_id);

        return $result;
    }
}
