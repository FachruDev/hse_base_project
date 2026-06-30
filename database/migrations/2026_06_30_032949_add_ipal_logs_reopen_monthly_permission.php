<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    private const PERMISSION_NAME = 'ipal.logs.reopen-monthly';

    public function up(): void
    {
        $permission = DB::table('permissions')->where('name', self::PERMISSION_NAME)->first();

        if ($permission === null) {
            $permissionId = DB::table('permissions')->insertGetId([
                'name' => self::PERMISSION_NAME,
                'guard_name' => 'web',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $permissionId = $permission->id;
        }

        $superadminRole = DB::table('roles')->where('name', 'superadmin')->first();

        if ($superadminRole !== null) {
            $roleHasPermission = DB::table('role_has_permissions')
                ->where('permission_id', $permissionId)
                ->where('role_id', $superadminRole->id)
                ->exists();

            if (! $roleHasPermission) {
                DB::table('role_has_permissions')->insert([
                    'permission_id' => $permissionId,
                    'role_id' => $superadminRole->id,
                ]);
            }
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        $permission = DB::table('permissions')->where('name', self::PERMISSION_NAME)->first();

        if ($permission !== null) {
            DB::table('role_has_permissions')->where('permission_id', $permission->id)->delete();
            DB::table('permissions')->where('id', $permission->id)->delete();
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
