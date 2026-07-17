<?php

namespace Modules\Tenant\Packages\CourseType\Repositories;

use Exception;
use Illuminate\Http\Request;
use Modules\Tenant\Packages\CourseType\Helpers\CourseTypeHelper;
use Modules\Tenant\Models\CourseType;

class CourseTypeRepository
{
    public static function list(Request $request)
    {
        CourseTypeHelper::validateListRequest($request);

        $page = $request->input('page');
        $size = $request->input('size');
        $search = $request->input('search');

        $courseTypes = CourseType::select()
            ->when($search, function ($query) use ($search) {
                $query->where('name', 'like', "%$search%");
            })
            ->orderBy('name', 'asc')
            ->paginate($size, ['*'], 'page', $page);

        $result = [
            'page' => $page,
            'size' => $size,
            'total' => $courseTypes->total(),
            'items' => $courseTypes->items(),
        ];

        return $result;
    }

    public static function create(Request $request)
    {
        CourseTypeHelper::validateRequest($request);

        $name = $request->input('name');

        $existsCourseTypeName = CourseType::select()
            ->where('name', $name)
            ->exists();

        if ($existsCourseTypeName) {
            throw new Exception('El nombre del tipo de curso ya existe.');
        }

        CourseType::create([
            'name' => $name,
        ]);

        return 'Tipo de curso creado correctamente.';
    }

    public static function update(int $id, Request $request)
    {
        CourseTypeHelper::validateRequest($request);

        $name = $request->input('name');

        $courseType = CourseType::findOrFail($id);

        $existsCourseTypeName = CourseType::select()
            ->where('id', '!=', $id)
            ->where('name', $name)
            ->exists();

        if ($existsCourseTypeName) {
            throw new Exception('El nombre del tipo de curso ya existe.');
        }

        $courseType->update([
            'name' => $name,
        ]);

        return 'Tipo de curso actualizado correctamente.';
    }

    public static function delete(int $id)
    {
        $courseType = CourseType::findOrFail($id);

        if ($courseType->courses()->exists()) {
            throw new Exception('No se puede eliminar el tipo de curso porque tiene cursos asociados.');
        }

        $courseType->delete();

        return "Tipo de curso eliminado correctamente.";
    }
}
