<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach ($this->permissionGroups() as $group => $permissions) {
            foreach ($permissions as $permissionName) {
                Permission::query()->updateOrCreate(
                    [
                        'name' => $permissionName,
                        'guard_name' => 'web',
                    ],
                );
            }
        }
    }

    /**
     * @return array<string, array<int, string>>
     */
    private function permissionGroups(): array
    {
        return [
            'admin' => [
                'admin.users.view',
                'admin.users.create',
                'admin.users.update',
                'admin.users.delete',
                'admin.roles.view',
                'admin.roles.create',
                'admin.roles.update',
                'admin.roles.delete',
                'admin.permissions.view',
                'admin.permissions.create',
                'admin.permissions.update',
                'admin.permissions.delete',
            ],
            'master' => [
                'master.checklist.view',
                'master.checklist.manage',
                'master.process.view',
                'master.process.manage',
                'master.batch.view',
                'master.batch.manage',
            ],
            'ipal' => [
                'ipal.logs.create',
                'ipal.logs.view',
                'ipal.logs.submit',
                'ipal.logs.approve',
            ],
            'configuration' => [
                'config.weekend.view',
                'config.weekend.manage',
                'config.holiday.view',
                'config.holiday.manage',
            ],
            'b3storage' => [
                'b3storage.master.view',
                'b3storage.master.manage',
                'b3storage.logs.create',
                'b3storage.logs.view',
                'b3storage.logs.update',
                'b3storage.logs.delete',
                'b3storage.monthly-report.view',
                'b3storage.monthly-approval.approve',
            ],
        ];
    }
}
