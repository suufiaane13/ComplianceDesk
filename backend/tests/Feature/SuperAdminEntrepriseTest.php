<?php

namespace Tests\Feature;

use Tests\TestCase;
use Tests\Traits\HasTestData;
use App\Models\User;

class SuperAdminEntrepriseTest extends TestCase
{
    use HasTestData;

    protected User $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupTestData();
        $this->superAdmin = $this->createSuperAdmin();
    }

    public function test_super_admin_can_list_all_entreprises(): void
    {
        $this->actingAs($this->superAdmin, 'sanctum');
        $response = $this->getJson('/api/entreprises');

        $response->assertOk()
            ->assertJsonCount(2);
    }

    public function test_super_admin_can_create_entreprise_with_admin(): void
    {
        $this->actingAs($this->superAdmin, 'sanctum');

        $response = $this->postJson('/api/entreprises', [
            'raison_sociale' => 'PME Nouvelle',
            'secteur_activite' => 'Commerce',
            'email' => 'contact@pme.ma',
            'admin' => [
                'nom' => 'Benali',
                'prenom' => 'Sara',
                'email' => 'sara@pme.ma',
                'password' => 'password123',
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('entreprise.raison_sociale', 'PME Nouvelle')
            ->assertJsonPath('admin.email', 'sara@pme.ma')
            ->assertJsonPath('admin.role', 'admin');

        $entrepriseId = $response->json('entreprise.id');
        $this->assertDatabaseHas('users', [
            'email' => 'sara@pme.ma',
            'role' => 'admin',
            'entreprise_id' => $entrepriseId,
        ]);
    }

    public function test_tenant_admin_cannot_create_entreprise(): void
    {
        $this->actingAs($this->admin, 'sanctum');

        $response = $this->postJson('/api/entreprises', [
            'raison_sociale' => 'Forbidden Co',
            'admin' => [
                'nom' => 'X',
                'prenom' => 'Y',
                'email' => 'xy@forbidden.ma',
                'password' => 'password123',
            ],
        ]);

        $response->assertStatus(403);
    }

    public function test_create_entreprise_rejects_invalid_phone(): void
    {
        $this->actingAs($this->superAdmin, 'sanctum');

        $response = $this->postJson('/api/entreprises', [
            'raison_sociale' => 'PME Tel',
            'telephone' => '123',
            'admin' => [
                'nom' => 'Tel',
                'prenom' => 'Test',
                'email' => 'tel@pme.ma',
                'password' => 'password123',
            ],
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['telephone']);
    }

    public function test_create_entreprise_accepts_moroccan_phone(): void
    {
        $this->actingAs($this->superAdmin, 'sanctum');

        $response = $this->postJson('/api/entreprises', [
            'raison_sociale' => 'PME Tel OK',
            'telephone' => '+212 522 00 00 00',
            'admin' => [
                'nom' => 'Tel',
                'prenom' => 'Ok',
                'email' => 'telok@pme.ma',
                'password' => 'password123',
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('entreprise.telephone', '+212 522 00 00 00');
    }

    public function test_super_admin_can_suspend_entreprise(): void
    {
        $this->actingAs($this->superAdmin, 'sanctum');

        $response = $this->patchJson("/api/entreprises/{$this->entreprise->id}/statut", [
            'statut' => 'suspendue',
        ]);

        $response->assertOk()
            ->assertJsonPath('statut', 'suspendue');
    }

    public function test_suspending_entreprise_revokes_tenant_tokens(): void
    {
        $adminToken = $this->admin->createToken('auth-token')->plainTextToken;
        $this->user->createToken('auth-token');

        $this->actingAs($this->superAdmin, 'sanctum');
        $this->patchJson("/api/entreprises/{$this->entreprise->id}/statut", [
            'statut' => 'suspendue',
        ])->assertOk();

        $this->assertEquals(0, $this->admin->fresh()->tokens()->count());
        $this->assertEquals(0, $this->user->fresh()->tokens()->count());

        $this->app['auth']->forgetGuards();

        $this->withHeader('Authorization', 'Bearer '.$adminToken)
            ->getJson('/api/dashboard')
            ->assertStatus(401);
    }

    public function test_cannot_change_statut_via_put_entreprise(): void
    {
        $this->actingAs($this->superAdmin, 'sanctum');

        $this->putJson("/api/entreprises/{$this->entreprise->id}", [
            'statut' => 'suspendue',
            'raison_sociale' => $this->entreprise->raison_sociale,
        ])->assertOk();

        $this->assertDatabaseHas('entreprises', [
            'id' => $this->entreprise->id,
            'statut' => 'active',
        ]);
    }

    public function test_super_admin_can_add_admin_to_entreprise(): void
    {
        $this->actingAs($this->superAdmin, 'sanctum');

        $response = $this->postJson("/api/entreprises/{$this->entreprise->id}/admins", [
            'nom' => 'Second',
            'prenom' => 'Admin',
            'email' => 'second.admin@test.ma',
            'password' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('role', 'admin')
            ->assertJsonPath('entreprise_id', $this->entreprise->id);
    }

    public function test_super_admin_cannot_access_dashboard(): void
    {
        $this->actingAs($this->superAdmin, 'sanctum');

        $response = $this->getJson('/api/dashboard');

        $response->assertStatus(403);
    }

    public function test_admin_cannot_create_super_admin_user(): void
    {
        $this->actingAs($this->admin, 'sanctum');

        $response = $this->postJson('/api/users', [
            'nom' => 'Hacker',
            'prenom' => 'Root',
            'email' => 'hacker@test.ma',
            'password' => 'password123',
            'role' => 'super_admin',
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('users', ['email' => 'hacker@test.ma']);
    }
}
