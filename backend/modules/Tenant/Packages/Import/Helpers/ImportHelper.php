<?php

namespace Modules\Tenant\Packages\Import\Helpers;

use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Validator;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx;

class ImportHelper
{
    public static function validateRequest($request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:xlsx,xls',
        ]);

        if ($validator->fails()) {
            throw new Exception($validator->errors()->first());
        }
    }

    public static function extractData($file)
    {
        $reader = new Xlsx();
        $spreadsheet = $reader->load($file);
        $worksheet = $spreadsheet->getActiveSheet();
        $data = $worksheet->toArray();

        return $data;
    }

    public static function formatData($import, $import_detail, $data)
    {
        $data = array_values(array_filter($data, function ($value) {
            return !empty($value[0]);
        }));

        $log = json_decode($import_detail->log);
        $aux = ['admissions', 'registrations', 'evaluations'];
        $columnsNumber = in_array($import->key, $aux) ? 2 : 1;
        $rowsNumber = in_array($import->key, $aux) ? 3 : 2;

        $title = $data[0][0];
        $columnsData = $data[$columnsNumber];
        $rowsData = array_slice($data, $rowsNumber);

        $columns = [];
        foreach (json_decode($import->attributes) as $key => $column) {
            $position = array_search($column, $columnsData);

            if ($position === false) {
                throw new Exception("Columna $column no encontrada.");
            }

            $columns[$key] = [$column, $position];
        }

        $rows = [];
        foreach ($rowsData as $index => $item) {
            $row = [];
            $skip = false;

            $id = $index + $rowsNumber + 3;
            $row['id'] = $id;

            foreach ($columns as $key => [$column, $position]) {
                if (!isset($item[$position]) || empty($item[$position])) {
                    if ($import->key === 'evaluations' && $column === 'NOTA') {
                        $item[$position] = 0.00;
                    } else {
                        $date = Carbon::now();
                        $log[] = "$date | Columna $column no encontrada o vacía en la fila $id";
                        $skip = true;
                        break;
                    }
                }

                $row[$key] = $item[$position];
            }

            if (!$skip) {
                $rows[] = (object) $row;
            }
        }

        $import->update(['title' => $title]);

        $date = Carbon::parse($import_detail->date);
        $now = Carbon::now();

        $import_detail->update([
            'progress' => 10,
            'time_elapsed' => $date->diffInMinutes($now),
            'log' => json_encode($log),
        ]);

        return $rows;
    }
}
