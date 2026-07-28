<?php

namespace Tests\Feature;

use Tests\TestCase;
use Tests\Traits\HasTestData;
use App\Models\User;
use App\Models\Notification;

class SuperAdminNotificationTest extends TestCase
{
    use HasTestData;

    protected User $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupTestData();
        $this->superAdmin = $this->createSuperAdmin();
    }

    public function test_super_admin_can_list_notifications(): void
    {
        Notification::create([
            'entreprise_id' => $this->entreprise->id,
            'utilisateur_id' => $this->superAdmin->id,
            'type' => 'entreprise_creee',
            'message' => 'Test plateforme',
            'date_creation' => now(),
            'lue' => false,
        ]);

        $this->actingAs($this->superAdmin, 'sanctum');

        $response = $this->getJson('/api/notifications');

        $response->assertOk()
            ->assertJsonFragment(['message' => 'Test plateforme']);
    }

    public function test_creating_entreprise_notifies_super_admins(): void
    {
        $this->actingAs($this->superAdmin, 'sanctum');

        $this->postJson('/api/entreprises', [
            'raison_sociale' => 'Notif Co',
            'admin' => [
                'nom' => 'Test',
                'prenom' => 'Admin',
                'email' => 'notif.admin@test.ma',
                'password' => 'password123',
            ],
        ])->assertStatus(201);

        $this->assertDatabaseHas('notifications', [
            'utilisateur_id' => $this->superAdmin->id,
            'type' => 'entreprise_creee',
        ]);
    }

    public function test_suspending_entreprise_notifies_super_admins(): void
    {
        $this->actingAs($this->superAdmin, 'sanctum');

        $this->patchJson("/api/entreprises/{$this->entreprise->id}/statut", [
            'statut' => 'suspendue',
        ])->assertOk();

        $this->assertDatabaseHas('notifications', [
            'utilisateur_id' => $this->superAdmin->id,
            'type' => 'entreprise_suspendue',
            'entreprise_id' => $this->entreprise->id,
        ]);
    }
}
