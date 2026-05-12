<?php

namespace Tests\Feature\Web;

use App\Models\Master\Holiday;
use App\Models\Master\OperationalWeekday;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ConfigurationCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_render_weekend_configuration_page_for_authorized_user(): void
    {
        $user = User::factory()->create([
            'external_id' => 'admin.config',
            'is_active' => true,
        ]);

        Permission::query()->create([
            'name' => 'config.weekend.view',
            'guard_name' => 'web',
        ]);

        $user->givePermissionTo('config.weekend.view');

        OperationalWeekday::query()->create([
            'day_of_week_iso' => 1,
            'day_name' => 'Senin',
            'is_off' => false,
        ]);

        $response = $this->get('/dashboard/configuration/weekend?user_id=admin.config');

        $response
            ->assertOk()
            ->assertSee('Konfigurasi Weekend');
    }

    public function test_can_update_weekend_status_via_web_controller(): void
    {
        $user = User::factory()->create([
            'external_id' => 'admin.config',
            'is_active' => true,
        ]);

        Permission::query()->create(['name' => 'config.weekend.view', 'guard_name' => 'web']);
        Permission::query()->create(['name' => 'config.weekend.manage', 'guard_name' => 'web']);
        $user->givePermissionTo(['config.weekend.view', 'config.weekend.manage']);

        $weekday = OperationalWeekday::query()->create([
            'day_of_week_iso' => 6,
            'day_name' => 'Sabtu',
            'is_off' => true,
        ]);

        $response = $this->patch("/dashboard/configuration/weekend/{$weekday->id}?user_id=admin.config", [
            'is_off' => false,
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('m_operational_weekdays', [
            'id' => $weekday->id,
            'is_off' => false,
        ]);
    }

    public function test_can_create_holiday_via_web_controller(): void
    {
        $user = User::factory()->create([
            'external_id' => 'admin.config',
            'is_active' => true,
        ]);

        Permission::query()->create(['name' => 'config.holiday.view', 'guard_name' => 'web']);
        Permission::query()->create(['name' => 'config.holiday.manage', 'guard_name' => 'web']);
        $user->givePermissionTo(['config.holiday.view', 'config.holiday.manage']);

        $response = $this->post('/dashboard/configuration/holidays?user_id=admin.config', [
            'holiday_date' => '2026-12-31',
            'name' => 'Cuti Bersama',
            'description' => 'Akhir tahun',
            'is_active' => true,
        ]);

        $response->assertRedirect();

        $holiday = Holiday::query()
            ->whereDate('holiday_date', '2026-12-31')
            ->where('name', 'Cuti Bersama')
            ->first();

        $this->assertNotNull($holiday);
    }
}
