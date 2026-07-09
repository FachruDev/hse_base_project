<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DepartmentSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class B3StorageNonHseUserSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeded_non_hse_b3_users_only_receive_b3_form_permissions(): void
    {
        $this->seed([
            DepartmentSeeder::class,
            PermissionSeeder::class,
            RolePermissionSeeder::class,
            UserSeeder::class,
        ]);

        $externalIds = [
            'irvan.m',
            'desi.sw',
            'slamet.k',
            'hermawansyah.i',
            'meti.a',
            's.rikadwirani',
            'ira.m',
            'dina.g',
            'k.sembiring',
            'salomo.pm',
            'angki.p',
        ];

        foreach ($externalIds as $externalId) {
            $user = User::query()->where('external_id', $externalId)->firstOrFail();

            $this->assertTrue($user->hasRole('non_hse_operator'));
            $this->assertTrue($user->can('b3storage.master.view'));
            $this->assertTrue($user->can('b3storage.logs.create'));
            $this->assertFalse($user->can('b3storage.logs.select-user'));
            $this->assertFalse($user->can('b3storage.logs.view'));
            $this->assertFalse($user->can('b3storage.monthly-report.view'));
            $this->assertFalse($user->can('ipal.logs.view'));
            $this->assertFalse($user->can('ipal.logs.create'));
        }
    }
}
