<?php

namespace Tests\Feature;

use Tests\TestCase;
use Tests\Traits\HasTestData;
use App\Models\Entreprise;
use App\Models\User;

class EntrepriseTest extends TestCase
{
    use HasTestData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupTestData();
    }

    public function test_user_can_list_own_entreprise(): void
    {
        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson('/api/entreprises');

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['raison_sociale' => 'Entreprise Alpha']);
    }

    public function test_user_cannot_see_other_entreprises(): void
    {
        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson('/api/entreprises');

        $response->assertOk();
        $data = $response->json();
        foreach ($data as $e) {
            $this->assertNotEquals($this->otherEntreprise->id, $e['id']);
        }
    }

    public function test_admin_can_update_own_entreprise(): void
    {
        $this->actingAs($this->admin, 'sanctum');
        $response = $this->putJson("/api/entreprises/{$this->entreprise->id}", [
            'raison_sociale' => 'Nouveau Nom',
        ]);

        $response->assertOk()
            ->assertJsonFragment(['raison_sociale' => 'Nouveau Nom']);
    }

    public function test_user_cannot_update_entreprise(): void
    {
        $this->actingAs($this->user, 'sanctum');
        $response = $this->putJson("/api/entreprises/{$this->entreprise->id}", [
            'raison_sociale' => 'Hacked',
        ]);

        $response->assertStatus(403);
    }

    public function test_cannot_update_other_entreprise(): void
    {
        $this->actingAs($this->admin, 'sanctum');
        $response = $this->putJson("/api/entreprises/{$this->otherEntreprise->id}", [
            'raison_sociale' => 'Stolen',
        ]);

        $response->assertStatus(403);
    }

    public function test_show_own_entreprise(): void
    {
        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson("/api/entreprises/{$this->entreprise->id}");

        $response->assertOk()
            ->assertJsonFragment(['raison_sociale' => 'Entreprise Alpha']);
    }

    public function test_cannot_show_other_entreprise(): void
    {
        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson("/api/entreprises/{$this->otherEntreprise->id}");

        $response->assertStatus(403);
    }

    public function test_list_entreprise_users(): void
    {
        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson("/api/entreprises/{$this->entreprise->id}/users");

        $response->assertOk()
            ->assertJsonCount(2);
    }

    public function test_user_cannot_list_other_entreprise_users(): void
    {
        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson("/api/entreprises/{$this->otherEntreprise->id}/users");

        $response->assertStatus(403);
    }

    public function test_admin_can_add_user_to_entreprise(): void
    {
        $this->actingAs($this->admin, 'sanctum');
        $response = $this->postJson("/api/entreprises/{$this->entreprise->id}/users", [
            'nom' => 'NewGuy',
            'prenom' => 'Test',
            'email' => 'newguy@test.ma',
            'password' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['email' => 'newguy@test.ma']);

        $this->assertDatabaseHas('users', [
            'email' => 'newguy@test.ma',
            'entreprise_id' => $this->entreprise->id,
        ]);
    }

    public function test_user_cannot_add_user_to_entreprise(): void
    {
        $this->actingAs($this->user, 'sanctum');
        $response = $this->postJson("/api/entreprises/{$this->entreprise->id}/users", [
            'nom' => 'Forbidden',
            'prenom' => 'Test',
            'email' => 'forbidden@test.ma',
            'password' => 'password123',
        ]);

        $response->assertStatus(403);
    }
}
