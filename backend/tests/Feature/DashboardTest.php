<?php

namespace Tests\Feature;

use Tests\TestCase;
use Tests\Traits\HasTestData;

class DashboardTest extends TestCase
{
    use HasTestData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupTestData();
    }

    public function test_dashboard_returns_counts(): void
    {
        $this->createObligation($this->entreprise, 'Ajour', now()->addMonths(6)->format('Y-m-d'), 'a_jour');
        $this->createObligation($this->entreprise, 'Proche', now()->addDays(10)->format('Y-m-d'), 'proche_echeance');
        $this->createObligation($this->entreprise, 'Expiree', now()->subDays(5)->format('Y-m-d'), 'expiree');

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson('/api/dashboard');

        $response->assertOk()
            ->assertJsonFragment([
                'total_obligations' => 3,
                'a_jour' => 1,
                'proches_echeance' => 1,
                'expirees' => 1,
            ]);
    }

    public function test_dashboard_scoped_to_entreprise(): void
    {
        $this->createObligation($this->entreprise, 'Mine');
        $this->createObligation($this->otherEntreprise, 'Yours');

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson('/api/dashboard');

        $response->assertOk()
            ->assertJsonFragment(['total_obligations' => 1]);
    }

    public function test_dashboard_returns_recent_obligations(): void
    {
        $this->createObligation($this->entreprise, 'Recent 1', now()->addDays(5)->format('Y-m-d'), 'a_jour');
        $this->createObligation($this->entreprise, 'Recent 2', now()->addDays(10)->format('Y-m-d'), 'a_jour');

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson('/api/dashboard');

        $response->assertOk()
            ->assertJsonStructure([
                'total_obligations',
                'a_jour',
                'proches_echeance',
                'expirees',
                'prochaines_echeances',
                'notifications_non_lues',
            ]);
    }

    public function test_dashboard_counts_unread_notifications(): void
    {
        $obligation = $this->createObligation($this->entreprise);
        $this->createNotification($this->admin, $obligation, 'echeance_proche', false);
        $this->createNotification($this->admin, $obligation, 'expiree', true);

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson('/api/dashboard');

        $response->assertOk()
            ->assertJsonFragment(['notifications_non_lues' => 1]);
    }

    public function test_dashboard_requires_auth(): void
    {
        $response = $this->getJson('/api/dashboard');

        $response->assertStatus(401);
    }

    public function test_dashboard_user_can_access(): void
    {
        $this->actingAs($this->user, 'sanctum');
        $response = $this->getJson('/api/dashboard');

        $response->assertOk();
    }
}
