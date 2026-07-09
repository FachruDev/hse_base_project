<?php

namespace Tests\Feature\Web;

use App\Models\Master\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ManagementCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_render_management_user_page_for_authorized_user(): void
    {
        $viewer = $this->createUserWithPermissions('admin.management', ['admin.users.view']);

        User::factory()->create([
            'external_id' => 'operator.01',
            'name' => 'Operator IPAL',
        ]);

        $response = $this->get('/dashboard/management/users?user_id='.$viewer->external_id);

        $response
            ->assertOk()
            ->assertSee('User')
            ->assertSee('Operator IPAL');
    }

    public function test_can_create_department_via_management_page(): void
    {
        $viewer = $this->createUserWithPermissions('admin.departments', [
            'admin.departments.view',
            'admin.departments.create',
        ]);

        $response = $this->post('/dashboard/management/departments?user_id='.$viewer->external_id, [
            'name' => 'HSE Department',
            'is_active' => true,
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('m_departments', [
            'name' => 'HSE Department',
            'is_active' => true,
        ]);
    }

    public function test_department_mutation_requires_manage_permission(): void
    {
        $viewer = $this->createUserWithPermissions('department.viewer', ['admin.departments.view']);
        $department = Department::query()->create([
            'name' => 'Engineering',
            'is_active' => true,
        ]);

        $response = $this->patch("/dashboard/management/departments/{$department->id}?user_id={$viewer->external_id}", [
            'name' => 'Engineering Updated',
            'is_active' => true,
        ]);

        $response->assertForbidden();
    }

    public function test_can_create_user_with_department_and_roles(): void
    {
        $viewer = $this->createUserWithPermissions('admin.users', [
            'admin.users.view',
            'admin.users.create',
        ]);
        $department = Department::query()->create([
            'name' => 'Quality Assurance',
            'is_active' => true,
        ]);
        Role::query()->create(['name' => 'operator', 'guard_name' => 'web']);

        $response = $this->post('/dashboard/management/users?user_id='.$viewer->external_id, [
            'external_id' => 'new.operator',
            'email' => 'new.operator@example.test',
            'password' => 'Secret123!',
            'name' => 'New Operator',
            'department_id' => $department->id,
            'roles' => ['operator'],
            'is_active' => true,
        ]);

        $response->assertRedirect();

        $createdUser = User::query()->where('external_id', 'new.operator')->firstOrFail();

        $this->assertSame($department->id, $createdUser->department_id);
        $this->assertTrue($createdUser->hasRole('operator'));
        $this->assertTrue(Hash::check('Secret123!', $createdUser->password));
    }

    public function test_user_password_is_optional_on_edit_and_can_be_replaced(): void
    {
        $viewer = $this->createUserWithPermissions('admin.users.editor', [
            'admin.users.view',
            'admin.users.update',
        ]);
        $user = User::factory()->create([
            'external_id' => 'editable.operator',
            'email' => 'editable.operator@example.test',
            'name' => 'Editable Operator',
            'password' => 'OldSecret123!',
        ]);
        $oldPasswordHash = $user->password;

        $this->patch("/dashboard/management/users/{$user->id}?user_id={$viewer->external_id}", [
            'external_id' => 'editable.operator',
            'email' => 'editable.operator@example.test',
            'password' => '',
            'name' => 'Editable Operator Updated',
            'department_id' => null,
            'roles' => [],
            'is_active' => true,
        ])->assertRedirect();

        $user->refresh();

        $this->assertSame($oldPasswordHash, $user->password);

        $this->patch("/dashboard/management/users/{$user->id}?user_id={$viewer->external_id}", [
            'external_id' => 'editable.operator',
            'email' => 'editable.operator@example.test',
            'password' => 'NewSecret123!',
            'name' => 'Editable Operator Updated',
            'department_id' => null,
            'roles' => [],
            'is_active' => true,
        ])->assertRedirect();

        $this->assertTrue(Hash::check('NewSecret123!', $user->refresh()->password));
    }

    public function test_can_create_role_and_sync_permissions(): void
    {
        $viewer = $this->createUserWithPermissions('admin.roles', [
            'admin.roles.view',
            'admin.roles.create',
        ]);
        Permission::query()->create(['name' => 'ipal.logs.view', 'guard_name' => 'web']);

        $response = $this->post('/dashboard/management/roles?user_id='.$viewer->external_id, [
            'name' => 'viewer',
            'guard_name' => 'web',
            'permissions' => ['ipal.logs.view'],
        ]);

        $response->assertRedirect();

        $role = Role::query()->where('name', 'viewer')->firstOrFail();

        $this->assertTrue($role->hasPermissionTo('ipal.logs.view'));
    }

    public function test_permission_mutation_requires_superadmin_role(): void
    {
        $viewer = $this->createUserWithPermissions('permission.admin', [
            'admin.permissions.view',
            'admin.permissions.create',
        ]);

        $this->post('/dashboard/management/permissions?user_id='.$viewer->external_id, [
            'name' => 'reports.audit.view',
            'guard_name' => 'web',
        ])->assertForbidden();

        Role::query()->create(['name' => 'superadmin', 'guard_name' => 'web']);
        $viewer->assignRole('superadmin');

        $this->post('/dashboard/management/permissions?user_id='.$viewer->external_id, [
            'name' => 'reports.audit.view',
            'guard_name' => 'web',
        ])->assertRedirect();

        $this->assertDatabaseHas('permissions', [
            'name' => 'reports.audit.view',
            'guard_name' => 'web',
        ]);
    }

    /**
     * @param  array<int, string>  $permissions
     */
    private function createUserWithPermissions(string $externalId, array $permissions): User
    {
        $user = User::factory()->create([
            'external_id' => $externalId,
            'is_active' => true,
        ]);

        foreach ($permissions as $permissionName) {
            Permission::query()->firstOrCreate([
                'name' => $permissionName,
                'guard_name' => 'web',
            ]);
        }

        $user->givePermissionTo($permissions);

        return $user;
    }
}
