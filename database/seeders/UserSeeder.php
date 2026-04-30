<?php

namespace Database\Seeders;

use App\Models\Master\Department;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rows = [
            ['department' => 'Produksi Pharma', 'name' => 'Irvan Maulana', 'external_id' => 'irvan.m'],
            ['department' => 'Produksi Kosmetik', 'name' => 'Desi Susilowati', 'external_id' => 'desi.sw'],
            ['department' => 'MPP', 'name' => 'Slamet Karyadi', 'external_id' => 'slamet.k'],
            ['department' => 'Quality Control', 'name' => 'Hermawansyah', 'external_id' => 'hermawansyah.i'],
            ['department' => 'Quality Assurance', 'name' => 'Meti Aprianti', 'external_id' => 'meti.a'],
            ['department' => 'R&D Pharma', 'name' => 'Santi Rika D', 'external_id' => 's.rikadwirani'],
            ['department' => 'R&D Kosmetik', 'name' => 'Ira Murtisari', 'external_id' => 'ira.m'],
            ['department' => 'R&D Andev', 'name' => 'Dina Gantina', 'external_id' => 'dina.g'],
            ['department' => 'DSP-Ware House', 'name' => 'Kolter Sembiring', 'external_id' => 'k.sembiring'],
            ['department' => 'Engineering', 'name' => 'Salomo P', 'external_id' => 'salomo.pm'],
            ['department' => 'General Affair', 'name' => 'Angki P', 'external_id' => 'angki.p'],
        ];

        foreach ($rows as $row) {
            $department = Department::query()->where('name', $row['department'])->first();

            $user = User::query()->updateOrCreate(
                ['external_id' => $row['external_id']],
                [
                    'name' => $row['name'],
                    'department_id' => $department?->id,
                    'is_active' => true,
                ],
            );

            $user->syncRoles(['supervisor']);
        }

        $superAdmin = User::query()->updateOrCreate(
            ['external_id' => 'superadmin'],
            [
                'name' => 'Super Admin',
                'department_id' => Department::query()->where('name', 'General Affair')->value('id'),
                'is_active' => true,
            ],
        );

        $superAdmin->syncRoles(['superadmin']);
    }
}
