<?php

namespace Tests\Feature;

use Tests\TestCase;
use Tests\Traits\HasTestData;
use App\Models\User;
use App\Models\Obligation;

class PlatformDashboardTest extends TestCase
{
    use HasTestData;

    protected User $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupTestData();
        $this->superAdmin = $this->createSuperAdmin();
        $this->createObligation($this->entreprise);
        $this->createObligation($this->otherEntreprise, 'Other Obligation');
    }

    public function test_super_admin_can_access_platform_dashboard(): void
    {
        $this->actingAs($this->superAdmin, 'sanctum');

        $response = $this->getJson('/api/admin/dashboard');

        $response->assertOk()
            ->assertJsonStructure([
                'entreprises_total',
                'entreprises_actives',
                'entreprises_suspendues',
                'users_total',
                'obligations_total',
                'recent_entreprises',
            ])
            ->assertJsonPath('entreprises_total', 2)
            ->assertJsonPath('obligations_total', 2);
    }

    public function test_tenant_admin_cannot_access_platform_dashboard(): void
    {
        $this->actingAs($this->admin, 'sanctum');

        $this->getJson('/api/admin/dashboard')->assertStatus(403);
    }

    public function test_super_admin_can_update_entreprise_user(): void
    {
        $this->actingAs($this->superAdmin, 'sanctum');

        $response = $this->putJson("/api/entreprises/{$this->entreprise->id}/users/{$this->user->id}", [
            'nom' => 'UpdatedBySA',
        ]);

        $response->assertOk()
            ->assertJsonPath('nom', 'UpdatedBySA');
    }

    public function test_super_admin_can_delete_entreprise_user(): void
    {
        $this->actingAs($this->superAdmin, 'sanctum');

        $response = $this->deleteJson("/api/entreprises/{$this->entreprise->id}/users/{$this->user->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('users', ['id' => $this->user->id]);
    }

    public function test_cannot_update_user_from_other_entreprise(): void
    {
        $foreign = $this->createUser($this->otherEntreprise, 'foreign2@test.ma');
        $this->actingAs($this->admin, 'sanctum');

        $this->putJson("/api/entreprises/{$this->entreprise->id}/users/{$foreign->id}", [
            'nom' => 'Hacked',
        ])->assertNotFound();
    }
}
