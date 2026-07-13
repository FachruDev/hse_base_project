<?php

namespace Database\Seeders;

use App\Models\Master\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            'Produksi Pharma',
            'Produksi Kosmetik',
            'MPP',
            'Quality Control',
            'Quality Assurance',
            'R&D Pharma',
            'R&D Kosmetik',
            'R&D Andev',
            'DSP-Ware House',
            'Engineering',
            'General Affair',
            'HSE',
        ];

        foreach ($departments as $departmentName) {
            Department::query()->updateOrCreate(
                ['name' => $departmentName],
                ['is_active' => true],
            );
        }
    }
}
