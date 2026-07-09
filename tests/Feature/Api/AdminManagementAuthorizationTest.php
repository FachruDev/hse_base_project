<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminManagementAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_users_api_requires_view_permission(): void
    {
        $user = User::factory()->create([
            'external_id' => 'plain.user',
            'is_active' => true,
        ]);

        $this->getJson('/api/admin/users?user_id='.$user->external_id)
            ->assertForbidden();

        Permission::query()->create(['name' => 'admin.users.view', 'guard_name' => 'web']);
        $user->givePermissionTo('admin.users.view');

        $this->getJson('/api/admin/users?user_id='.$user->external_id)
            ->assertOk();
    }

    public function test_admin_users_api_can_create_user_with_password(): void
    {
        $user = User::factory()->create([
            'external_id' => 'user.admin',
            'is_active' => true,
        ]);

        Permission::query()->create(['name' => 'admin.users.create', 'guard_name' => 'web']);
        $user->givePermissionTo('admin.users.create');

        $this->postJson('/api/admin/users?user_id='.$user->external_id, [
            'external_id' => 'mobile.user',
            'email' => 'mobile.user@example.test',
            'password' => 'Secret123!',
            'name' => 'Mobile User',
            'is_active' => true,
        ])->assertCreated();

        $createdUser = User::query()->where('external_id', 'mobile.user')->firstOrFail();

        $this->assertTrue(Hash::check('Secret123!', $createdUser->password));
    }

    public function test_admin_roles_api_requires_create_permission(): void
    {
        $user = User::factory()->create([
            'external_id' => 'role.viewer',
            'is_active' => true,
        ]);

        $this->postJson('/api/admin/roles?user_id='.$user->external_id, [
            'name' => 'new-role',
            'guard_name' => 'web',
        ])->assertForbidden();

        Permission::query()->create(['name' => 'admin.roles.create', 'guard_name' => 'web']);
        $user->givePermissionTo('admin.roles.create');

        $this->postJson('/api/admin/roles?user_id='.$user->external_id, [
            'name' => 'new-role',
            'guard_name' => 'web',
        ])->assertCreated();
    }

    public function test_admin_permissions_api_mutation_requires_superadmin_role(): void
    {
        $user = User::factory()->create([
            'external_id' => 'permission.editor',
            'is_active' => true,
        ]);

        Permission::query()->create(['name' => 'admin.permissions.create', 'guard_name' => 'web']);
        $user->givePermissionTo('admin.permissions.create');

        $this->postJson('/api/admin/permissions?user_id='.$user->external_id, [
            'name' => 'reports.view',
            'guard_name' => 'web',
        ])->assertForbidden();

        Role::query()->create(['name' => 'superadmin', 'guard_name' => 'web']);
        $user->assignRole('superadmin');

        $this->postJson('/api/admin/permissions?user_id='.$user->external_id, [
            'name' => 'reports.view',
            'guard_name' => 'web',
        ])->assertCreated();
    }
}
