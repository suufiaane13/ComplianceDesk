<?php

namespace Tests\Feature;

use Tests\TestCase;
use Tests\Traits\HasTestData;

class AuthTest extends TestCase
{
    use HasTestData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->entreprise = $this->createEntreprise();
    }

    public function test_register_endpoint_is_removed(): void
    {
        $response = $this->postJson('/api/register', [
            'nom' => 'Dupont',
            'prenom' => 'Jean',
            'email' => 'jean@test.ma',
            'password' => 'secret1234',
        ]);

        $response->assertStatus(404);
    }

    public function test_login_returns_token(): void
    {
        $this->createAdmin($this->entreprise);

        $response = $this->postJson('/api/login', [
            'email' => 'admin@test.ma',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'token', 'user'])
            ->assertJson(['message' => 'Connexion réussie']);
    }

    public function test_login_rejects_wrong_password(): void
    {
        $this->createAdmin($this->entreprise);

        $response = $this->postJson('/api/login', [
            'email' => 'admin@test.ma',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422);
    }

    public function test_login_rejects_nonexistent_user(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'ghost@test.ma',
            'password' => 'password123',
        ]);

        $response->assertStatus(422);
    }

    public function test_login_blocked_when_entreprise_suspended(): void
    {
        $this->createAdmin($this->entreprise);
        $this->entreprise->update(['statut' => 'suspendue']);

        $response = $this->postJson('/api/login', [
            'email' => 'admin@test.ma',
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_super_admin_can_login_without_entreprise(): void
    {
        $this->createSuperAdmin();

        $response = $this->postJson('/api/login', [
            'email' => 'superadmin@test.ma',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonPath('user.role', 'super_admin');
    }

    public function test_user_endpoint_returns_authenticated_user(): void
    {
        $this->setupTestData();
        $this->actingAs($this->admin, 'sanctum');

        $response = $this->getJson('/api/user');

        $response->assertOk()
            ->assertJsonFragment(['email' => 'admin@test.ma']);
    }

    public function test_user_endpoint_requires_auth(): void
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401);
    }

    public function test_update_profile(): void
    {
        $this->setupTestData();
        $this->actingAs($this->admin, 'sanctum');

        $response = $this->putJson('/api/user', [
            'nom' => 'NouveauNom',
        ]);

        $response->assertOk()
            ->assertJsonFragment(['nom' => 'NouveauNom']);
    }

    public function test_update_password(): void
    {
        $this->setupTestData();
        $this->actingAs($this->admin, 'sanctum');

        $response = $this->putJson('/api/user/password', [
            'current_password' => 'password123',
            'password' => 'newpass123',
            'password_confirmation' => 'newpass123',
        ]);

        $response->assertOk();
    }

    public function test_update_password_rejects_wrong_current(): void
    {
        $this->setupTestData();
        $this->actingAs($this->admin, 'sanctum');

        $response = $this->putJson('/api/user/password', [
            'current_password' => 'wrongpassword',
            'password' => 'newpass123',
            'password_confirmation' => 'newpass123',
        ]);

        $response->assertStatus(422);
    }

    public function test_logout_deletes_token(): void
    {
        $this->setupTestData();
        $token = $this->admin->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/logout');

        $response->assertOk();
        $this->assertEquals(0, $this->admin->fresh()->tokens()->count());
    }

    public function test_suspended_entreprise_blocks_authenticated_api(): void
    {
        $this->setupTestData();
        $token = $this->admin->createToken('auth-token')->plainTextToken;
        $this->entreprise->update(['statut' => 'suspendue']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/dashboard');

        $response->assertStatus(403);
        $this->assertEquals(0, $this->admin->fresh()->tokens()->count());
    }
}
