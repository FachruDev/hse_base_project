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
            ['department' => 'Produksi Pharma', 'name' => 'Irvan Maulana', 'external_id' => 'irvan.m', 'email' => 'irvan.m@galenium.local'],
            ['department' => 'Produksi Kosmetik', 'name' => 'Desi Susilowati', 'external_id' => 'desi.sw', 'email' => 'desi.sw@galenium.local'],
            ['department' => 'MPP', 'name' => 'Slamet Karyadi', 'external_id' => 'slamet.k', 'email' => 'slamet.k@galenium.local'],
            ['department' => 'Quality Control', 'name' => 'Hermawansyah', 'external_id' => 'hermawansyah.i', 'email' => 'hermawansyah.i@galenium.local'],
            ['department' => 'Quality Assurance', 'name' => 'Meti Aprianti', 'external_id' => 'meti.a', 'email' => 'meti.a@galenium.local'],
            ['department' => 'R&D Pharma', 'name' => 'Santi Rika D', 'external_id' => 's.rikadwirani', 'email' => 's.rikadwirani@galenium.local'],
            ['department' => 'R&D Kosmetik', 'name' => 'Ira Murtisari', 'external_id' => 'ira.m', 'email' => 'ira.m@galenium.local'],
            ['department' => 'R&D Andev', 'name' => 'Dina Gantiha', 'external_id' => 'dina.g', 'email' => 'dina.g@galenium.local'],
            ['department' => 'DSP-Ware House', 'name' => 'Kolter Sembiring', 'external_id' => 'k.sembiring', 'email' => 'k.sembiring@galenium.local'],
            ['department' => 'Engineering', 'name' => 'Salomo P', 'external_id' => 'salomo.pm', 'email' => 'salomo.pm@galenium.local'],
            ['department' => 'General Affair', 'name' => 'Angki P', 'external_id' => 'angki.p', 'email' => 'angki.p@galenium.local'],
        ];

        foreach ($rows as $row) {
            $department = Department::query()->where('name', $row['department'])->first();

            $user = User::query()->updateOrCreate(
                ['external_id' => $row['external_id']],
                [
                    'name' => $row['name'],
                    'email' => $row['email'],
                    'department_id' => $department?->id,
                    'is_active' => true,
                ],
            );

            $this->ensureDefaultPassword($user);
            $user->syncRoles(['non_hse_operator']);
        }

        $superAdmin = User::query()->updateOrCreate(
            ['external_id' => 'superadmin'],
            [
                'name' => 'Super Admin',
                'email' => 'superadmin@galenium.local',
                'department_id' => Department::query()->where('name', 'General Affair')->value('id'),
                'is_active' => true,
            ],
        );

        $this->ensureDefaultPassword($superAdmin);
        $superAdmin->syncRoles(['superadmin']);
    }

    private function ensureDefaultPassword(User $user): void
    {
        if (is_string($user->password) && $user->password !== '') {
            return;
        }

        $user->forceFill([
            'password' => 'Gpl12345!',
        ])->save();
    }
}
