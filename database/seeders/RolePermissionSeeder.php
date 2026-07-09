<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $rolePermissionMap = [
            'superadmin' => [
                'admin.*',
                'master.*',
                'ipal.*',
                'config.*',
                'b3storage.*',
            ],
            'admin' => [
                'admin.*',
                'master.*',
                'ipal.logs.view',
                'config.*',
                'b3storage.*',
            ],
            'supervisor' => [
                'master.checklist.view',
                'master.process.view',
                'master.batch.view',
                'ipal.logs.view-all',
                'ipal.logs.approve',
                'config.weekend.view',
                'config.holiday.view',
                'b3storage.master.view',
                'b3storage.logs.view-all',
                'b3storage.monthly-report.view',
                'b3storage.monthly-approval.approve',
            ],
            'hse_dept_head' => [
                'b3storage.master.view',
                'b3storage.logs.view-all',
                'b3storage.monthly-report.view',
                'b3storage.monthly-approval.approve',
            ],
            'operator' => [
                'master.checklist.view',
                'master.process.view',
                'master.batch.view',
                'ipal.logs.create',
                'ipal.logs.view-all',
                'ipal.logs.submit',
                'config.weekend.view',
                'config.holiday.view',
                'b3storage.master.view',
                'b3storage.logs.create',
                'b3storage.logs.select-user',
                'b3storage.logs.view-all',
                'b3storage.logs.update',
                'b3storage.monthly-report.view',
            ],
            'non_hse_operator' => [
                'b3storage.master.view',
                'b3storage.logs.create',
                'b3storage.logs.view-own',
            ],
        ];

        $allPermissions = $this->allPermissions();

        foreach ($rolePermissionMap as $roleName => $patterns) {
            $role = Role::query()->updateOrCreate(
                [
                    'name' => $roleName,
                    'guard_name' => 'web',
                ],
            );

            $resolvedPermissions = [];

            foreach ($patterns as $pattern) {
                if (str_ends_with($pattern, '*')) {
                    $prefix = rtrim($pattern, '*');
                    $resolvedPermissions = array_merge(
                        $resolvedPermissions,
                        array_values(array_filter($allPermissions, static fn (string $permission): bool => str_starts_with($permission, $prefix))),
                    );

                    continue;
                }

                $resolvedPermissions[] = $pattern;
            }

            $role->syncPermissions(Arr::sort(array_values(array_unique($resolvedPermissions))));
        }
    }

    /**
     * @return array<int, string>
     */
    private function allPermissions(): array
    {
        return [
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
            'admin.departments.view',
            'admin.departments.create',
            'admin.departments.update',
            'admin.departments.delete',
            'master.checklist.view',
            'master.checklist.manage',
            'master.process.view',
            'master.process.manage',
            'master.batch.view',
            'master.batch.manage',
            'ipal.logs.create',
            'ipal.logs.view-own',
            'ipal.logs.view-all',
            'ipal.logs.view',
            'ipal.logs.submit',
            'ipal.logs.approve',
            'ipal.logs.reopen-monthly',
            'config.weekend.view',
            'config.weekend.manage',
            'config.holiday.view',
            'config.holiday.manage',
            'b3storage.master.view',
            'b3storage.master.manage',
            'b3storage.logs.create',
            'b3storage.logs.select-user',
            'b3storage.logs.view-own',
            'b3storage.logs.view-all',
            'b3storage.logs.view',
            'b3storage.logs.update',
            'b3storage.logs.delete',
            'b3storage.monthly-report.view',
            'b3storage.monthly-approval.approve',
        ];
    }
}
