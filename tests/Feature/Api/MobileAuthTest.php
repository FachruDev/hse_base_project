<?php

namespace Tests\Feature\Api;

use App\Models\Master\ChecklistTemplate;
use App\Models\MobileApiToken;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MobileAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_mobile_user_can_login_with_user_id_and_email(): void
    {
        User::factory()->create([
            'external_id' => 'irvan.m',
            'email' => 'irvan.m@galenium.local',
            'name' => 'Irvan Maulana',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'user_id' => 'irvan.m',
            'email' => 'irvan.m@galenium.local',
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

    public function test_mobile_login_rejects_invalid_email_pair(): void
    {
        User::factory()->create([
            'external_id' => 'irvan.m',
            'email' => 'irvan.m@galenium.local',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'user_id' => 'irvan.m',
            'email' => 'wrong@galenium.local',
        ]);

        $response
            ->assertUnauthorized()
            ->assertJsonPath('message', 'User ID atau email tidak sesuai, atau user tidak aktif.');
    }

    public function test_bearer_token_can_access_api_and_logout_invalidates_token(): void
    {
        User::factory()->create([
            'external_id' => 'irvan.m',
            'email' => 'irvan.m@galenium.local',
            'name' => 'Irvan Maulana',
        ]);

        ChecklistTemplate::query()->create([
            'name' => 'Template Harian',
            'is_active' => true,
        ]);

        $loginResponse = $this->postJson('/api/auth/login', [
            'user_id' => 'irvan.m',
            'email' => 'irvan.m@galenium.local',
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
