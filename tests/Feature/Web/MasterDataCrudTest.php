<?php

namespace Tests\Feature\Web;

use App\Models\Master\BatchSection;
use App\Models\Master\ChecklistTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class MasterDataCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_render_master_data_page_for_authorized_user(): void
    {
        $user = User::factory()->create([
            'external_id' => 'superadmin.01',
            'name' => 'Super Admin',
            'is_active' => true,
        ]);

        Permission::query()->create([
            'name' => 'master.checklist.view',
            'guard_name' => 'web',
        ]);

        $user->givePermissionTo('master.checklist.view');

        ChecklistTemplate::query()->create([
            'name' => 'Template Harian',
            'is_active' => true,
        ]);

        $response = $this->get('/dashboard/master-data/checklist-templates?user_id=superadmin.01');

        $response
            ->assertOk()
            ->assertSee('Template Checklist')
            ->assertSee('Template Harian');
    }

    public function test_can_create_master_data_via_web_controller(): void
    {
        $user = User::factory()->create([
            'external_id' => 'superadmin.01',
            'name' => 'Super Admin',
            'is_active' => true,
        ]);

        Permission::query()->create([
            'name' => 'master.checklist.view',
            'guard_name' => 'web',
        ]);
        Permission::query()->create([
            'name' => 'master.checklist.manage',
            'guard_name' => 'web',
        ]);

        $user->givePermissionTo([
            'master.checklist.view',
            'master.checklist.manage',
        ]);

        $response = $this->post('/dashboard/master-data/checklist-templates?user_id=superadmin.01', [
            'name' => 'Checklist Shift Pagi',
            'is_active' => true,
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('m_checklist_templates', [
            'name' => 'Checklist Shift Pagi',
            'is_active' => true,
        ]);
    }

    public function test_can_create_batch_section_and_batch_item_with_section(): void
    {
        $user = User::factory()->create([
            'external_id' => 'superadmin.01',
            'name' => 'Super Admin',
            'is_active' => true,
        ]);

        Permission::query()->create(['name' => 'master.batch.view', 'guard_name' => 'web']);
        Permission::query()->create(['name' => 'master.batch.manage', 'guard_name' => 'web']);

        $user->givePermissionTo([
            'master.batch.view',
            'master.batch.manage',
        ]);

        $this->post('/dashboard/master-data/batch-sections?user_id=superadmin.01', [
            'name' => 'Netralisasi',
            'order_no' => 1,
        ])->assertRedirect();

        $this->assertDatabaseHas('m_batch_sections', [
            'name' => 'Netralisasi',
            'order_no' => 1,
        ]);

        $sectionId = (int) BatchSection::query()
            ->where('name', 'Netralisasi')
            ->value('id');

        $this->post('/dashboard/master-data/batch-items?user_id=superadmin.01', [
            'section_id' => $sectionId,
            'name' => 'pH',
            'input_type' => 'decimal_2',
            'order_no' => 1,
        ])->assertRedirect();

        $this->assertDatabaseHas('m_batch_items', [
            'section_id' => $sectionId,
            'name' => 'pH',
            'input_type' => 'decimal_2',
            'order_no' => 1,
        ]);
    }
}
