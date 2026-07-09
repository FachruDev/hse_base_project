<?php

namespace Tests\Feature\Api;

use App\Models\Master\ChecklistTemplate;
use App\Models\MobileApiToken;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class MobileAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_mobile_user_can_login_with_user_id_and_password(): void
    {
        $user = User::factory()->create([
            'external_id' => 'irvan.m',
            'email' => 'irvan.m@galenium.local',
            'name' => 'Irvan Maulana',
        ]);

        Permission::query()->create(['name' => 'master.checklist.view', 'guard_name' => 'web']);
        $user->givePermissionTo('master.checklist.view');

        $response = $this->postJson('/api/auth/login', [
            'login' => 'irvan.m',
            'password' => 'Gpl12345!',
            'device_name' => 'flutter-debug',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.token_type', 'Bearer')
            ->assertJsonPath('data.user.user_id', 'irvan.m')
            ->assertJsonPath('data.user.email', 'irvan.m@galenium.local')
            ->assertJsonStructure([
                'data' => [
                    'access_token',
                    'user' => ['permissions'],
                ],
            ]);

        $this->assertSame(1, MobileApiToken::query()->count());
        $this->assertNotSame($response->json('data.access_token'), MobileApiToken::query()->first()?->token_hash);
    }

    public function test_mobile_user_can_login_with_email_and_password(): void
    {
        User::factory()->create([
            'external_id' => 'irvan.m',
            'email' => 'irvan.m@galenium.local',
        ]);

        $this->postJson('/api/auth/login', [
            'login' => 'irvan.m@galenium.local',
            'password' => 'Gpl12345!',
        ])
            ->assertOk()
            ->assertJsonPath('data.user.user_id', 'irvan.m');
    }

    public function test_mobile_login_rejects_invalid_password(): void
    {
        User::factory()->create([
            'external_id' => 'irvan.m',
            'email' => 'irvan.m@galenium.local',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'login' => 'irvan.m',
            'password' => 'wrong-password',
        ]);

        $response
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Login atau password tidak sesuai, atau user tidak aktif.');
    }

    public function test_mobile_login_rejects_inactive_user(): void
    {
        User::factory()->inactive()->create([
            'external_id' => 'inactive.user',
            'email' => 'inactive.user@galenium.local',
        ]);

        $this->postJson('/api/auth/login', [
            'login' => 'inactive.user',
            'password' => 'Gpl12345!',
        ])
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Login atau password tidak sesuai, atau user tidak aktif.');
    }

    public function test_bearer_token_can_access_api_and_logout_invalidates_token(): void
    {
        $user = User::factory()->create([
            'external_id' => 'irvan.m',
            'email' => 'irvan.m@galenium.local',
            'name' => 'Irvan Maulana',
        ]);

        Permission::query()->create(['name' => 'master.checklist.view', 'guard_name' => 'web']);
        $user->givePermissionTo('master.checklist.view');

        ChecklistTemplate::query()->create([
            'name' => 'Template Harian',
            'is_active' => true,
        ]);

        $loginResponse = $this->postJson('/api/auth/login', [
            'login' => 'irvan.m',
            'password' => 'Gpl12345!',
        ]);

        $token = $loginResponse->json('data.access_token');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/master/checklist')
            ->assertOk();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.user.user_id', 'irvan.m');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/auth/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Logout berhasil.');

        $this->assertSame(0, MobileApiToken::query()->count());

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/master/checklist')
            ->assertUnauthorized();
    }
}
