<?php

namespace Tests\Feature;

use Tests\TestCase;
use Tests\Traits\HasTestData;
use App\Models\Notification;

class NotificationTest extends TestCase
{
    use HasTestData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupTestData();
    }

    public function test_list_notifications(): void
    {
        $obligation = $this->createObligation($this->entreprise);
        $this->createNotification($this->admin, $obligation, 'echeance_proche');
        $this->createNotification($this->admin, $obligation, 'expiree', true);

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson('/api/notifications');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_notifications_scoped_to_user(): void
    {
        $obligation = $this->createObligation($this->entreprise);
        $this->createNotification($this->admin, $obligation);
        $this->createNotification($this->user, $obligation);

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson('/api/notifications');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_notifications_sorted_unread_first(): void
    {
        $obligation = $this->createObligation($this->entreprise);
        $this->createNotification($this->admin, $obligation, 'echeance_proche', true);
        $this->createNotification($this->admin, $obligation, 'expiree', false);

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson('/api/notifications');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertFalse($data[0]['lue']);
        $this->assertTrue($data[1]['lue']);
    }

    public function test_filter_by_lue(): void
    {
        $obligation = $this->createObligation($this->entreprise);
        $this->createNotification($this->admin, $obligation, 'echeance_proche', true);
        $this->createNotification($this->admin, $obligation, 'expiree', false);

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson('/api/notifications?lue=true');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_mark_as_read(): void
    {
        $obligation = $this->createObligation($this->entreprise);
        $notification = $this->createNotification($this->admin, $obligation, 'echeance_proche', false);

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->patchJson("/api/notifications/{$notification->id}/read");

        $response->assertOk();
        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'lue' => true,
        ]);
    }

    public function test_mark_as_read_other_users_notification(): void
    {
        $obligation = $this->createObligation($this->entreprise);
        $notification = $this->createNotification($this->user, $obligation, 'echeance_proche', false);

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->patchJson("/api/notifications/{$notification->id}/read");

        $response->assertStatus(404);
    }

    public function test_mark_all_read(): void
    {
        $obligation = $this->createObligation($this->entreprise);
        $this->createNotification($this->admin, $obligation, 'echeance_proche', false);
        $this->createNotification($this->admin, $obligation, 'expiree', false);

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->patchJson('/api/notifications/read-all');

        $response->assertOk();

        $unread = Notification::where('utilisateur_id', $this->admin->id)->where('lue', false)->count();
        $this->assertEquals(0, $unread);
    }

    public function test_unread_count(): void
    {
        $obligation = $this->createObligation($this->entreprise);
        $this->createNotification($this->admin, $obligation, 'echeance_proche', false);
        $this->createNotification($this->admin, $obligation, 'expiree', false);
        $this->createNotification($this->admin, $obligation, 'echeance_proche', true);

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson('/api/notifications/unread-count');

        $response->assertOk()
            ->assertJson(['unread_count' => 2]);
    }

    public function test_notifications_require_auth(): void
    {
        $response = $this->getJson('/api/notifications');

        $response->assertStatus(401);
    }

    public function test_obligation_creation_creates_notifications(): void
    {
        $this->actingAs($this->admin, 'sanctum');
        $this->postJson('/api/obligations', [
            'intitule' => 'Expirée notif',
            'date_echeance' => now()->subDays(5)->format('Y-m-d'),
        ]);

        $this->assertDatabaseHas('notifications', [
            'utilisateur_id' => $this->admin->id,
            'type' => 'expiree',
        ]);

        $this->assertDatabaseHas('notifications', [
            'utilisateur_id' => $this->user->id,
            'type' => 'expiree',
        ]);
    }
}
