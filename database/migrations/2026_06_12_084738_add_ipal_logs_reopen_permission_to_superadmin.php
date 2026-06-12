<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Insert permission if not already present
        $permissionId = DB::table('permissions')->insertGetId([
            'name' => 'ipal.logs.reopen',
            'guard_name' => 'web',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Assign to superadmin role (id = 1)
        $superadminRole = DB::table('roles')->where('name', 'superadmin')->first();

        if ($superadminRole !== null) {
            DB::table('role_has_permissions')->insert([
                'permission_id' => $permissionId,
                'role_id' => $superadminRole->id,
            ]);
        }
    }

    public function down(): void
    {
        $permission = DB::table('permissions')->where('name', 'ipal.logs.reopen')->first();

        if ($permission !== null) {
            DB::table('role_has_permissions')->where('permission_id', $permission->id)->delete();
            DB::table('permissions')->where('id', $permission->id)->delete();
        }
    }
};
