<?php

namespace Tests\Feature\Api;

use App\Models\Master\ChecklistTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExternalIdAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_rejects_request_when_userid_is_missing(): void
    {
        $response = $this->getJson('/api/master/checklist');

        $response
            ->assertUnauthorized()
            ->assertJson([
                'message' => 'Parameter userid wajib diisi.',
            ]);
    }

    public function test_rejects_request_when_userid_is_not_registered(): void
    {
        $response = $this->getJson('/api/master/checklist?userid=unknown.user');

        $response
            ->assertUnauthorized()
            ->assertJson([
                'message' => 'User tidak ditemukan atau tidak aktif.',
            ]);
    }

    public function test_allows_request_when_userid_exists(): void
    {
        User::factory()->create([
            'external_id' => 'irvan.m',
            'name' => 'Irvan Maulana',
            'is_active' => true,
        ]);

        ChecklistTemplate::query()->create([
            'name' => 'Template Harian',
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/master/checklist?userid=irvan.m');

        $response->assertStatus(200);
    }
}
