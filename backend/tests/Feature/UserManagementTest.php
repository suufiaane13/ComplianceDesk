<?php

namespace Tests\Feature;

use Tests\TestCase;
use Tests\Traits\HasTestData;
use App\Models\User;

class UserManagementTest extends TestCase
{
    use HasTestData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupTestData();
    }

    public function test_admin_can_list_users(): void
    {
        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson('/api/users');

        $response->assertOk()
            ->assertJsonCount(2);
    }

    public function test_user_cannot_list_users(): void
    {
        $this->actingAs($this->user, 'sanctum');
        $response = $this->getJson('/api/users');

        $response->assertStatus(403);
    }

    public function test_users_scoped_to_entreprise(): void
    {
        $this->createUser($this->otherEntreprise, 'foreign@test.ma');

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson('/api/users');

        $response->assertOk()
            ->assertJsonCount(2);

        $emails = array_column($response->json('data') ?? $response->json(), 'email');
        $this->assertNotContains('foreign@test.ma', $emails);
    }

    public function test_admin_can_create_user(): void
    {
        $this->actingAs($this->admin, 'sanctum');
        $response = $this->postJson('/api/users', [
            'nom' => 'Created',
            'prenom' => 'User',
            'email' => 'created@test.ma',
            'password' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['email' => 'created@test.ma']);

        $this->assertDatabaseHas('users', [
            'email' => 'created@test.ma',
            'entreprise_id' => $this->entreprise->id,
        ]);
    }

    public function test_user_cannot_create_user(): void
    {
        $this->actingAs($this->user, 'sanctum');
        $response = $this->postJson('/api/users', [
            'nom' => 'Forbidden',
            'prenom' => 'User',
            'email' => 'forbidden@test.ma',
            'password' => 'password123',
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_update_user(): void
    {
        $this->actingAs($this->admin, 'sanctum');
        $response = $this->putJson("/api/users/{$this->user->id}", [
            'nom' => 'UpdatedName',
        ]);

        $response->assertOk()
            ->assertJsonFragment(['nom' => 'UpdatedName']);
    }

    public function test_user_cannot_update_other_user(): void
    {
        $this->actingAs($this->user, 'sanctum');
        $response = $this->putJson("/api/users/{$this->admin->id}", [
            'nom' => 'Hacked',
        ]);

        $response->assertStatus(403);
    }

    public function test_cannot_update_other_entreprise_user(): void
    {
        $foreign = $this->createUser($this->otherEntreprise, 'foreign@test.ma');

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->putJson("/api/users/{$foreign->id}", [
            'nom' => 'Stolen',
        ]);

        $response->assertNotFound();
    }

    public function test_admin_can_delete_user(): void
    {
        $this->actingAs($this->admin, 'sanctum');
        $response = $this->deleteJson("/api/users/{$this->user->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('users', ['id' => $this->user->id]);
    }

    public function test_user_cannot_delete_user(): void
    {
        $this->actingAs($this->user, 'sanctum');
        $response = $this->deleteJson("/api/users/{$this->admin->id}");

        $response->assertStatus(403);
    }

    public function test_admin_cannot_delete_self(): void
    {
        $this->actingAs($this->admin, 'sanctum');
        $response = $this->deleteJson("/api/users/{$this->admin->id}");

        $response->assertStatus(400);
    }

    public function test_cannot_delete_other_entreprise_user(): void
    {
        $foreign = $this->createUser($this->otherEntreprise, 'foreign@test.ma');

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->deleteJson("/api/users/{$foreign->id}");

        $response->assertNotFound();
    }

    public function test_admin_can_create_user_with_admin_role(): void
    {
        $this->actingAs($this->admin, 'sanctum');
        $this->postJson('/api/users', [
            'nom' => 'Second',
            'prenom' => 'Admin',
            'email' => 'secondadmin@test.ma',
            'password' => 'password123',
            'role' => 'admin',
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'secondadmin@test.ma',
            'role' => 'admin',
        ]);
    }

    public function test_cannot_demote_last_admin(): void
    {
        $this->actingAs($this->admin, 'sanctum');

        $response = $this->putJson("/api/users/{$this->admin->id}", [
            'role' => 'user',
        ]);

        $response->assertStatus(400);
        $this->assertDatabaseHas('users', [
            'id' => $this->admin->id,
            'role' => 'admin',
        ]);
    }

    public function test_cannot_delete_last_admin(): void
    {
        $secondAdmin = User::create([
            'entreprise_id' => $this->entreprise->id,
            'nom' => 'Second',
            'prenom' => 'Admin',
            'email' => 'secondadmin@test.ma',
            'password' => 'password123',
            'role' => User::ROLE_ADMIN,
            'date_creation' => now(),
        ]);

        $this->actingAs($this->admin, 'sanctum');
        $this->deleteJson("/api/users/{$secondAdmin->id}")->assertOk();

        // Promote regular user, then that user deletes the original admin
        $this->putJson("/api/users/{$this->user->id}", ['role' => 'admin'])->assertOk();

        $this->actingAs($this->user->fresh(), 'sanctum');
        $this->deleteJson("/api/users/{$this->admin->id}")->assertOk();

        // Sole admin left — cannot demote themselves
        $this->putJson("/api/users/{$this->user->id}", ['role' => 'user'])->assertStatus(400);
    }
}
