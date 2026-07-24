<?php

namespace Tests\Feature;

use Tests\TestCase;
use Tests\Traits\HasTestData;
use App\Models\Obligation;

class ObligationTest extends TestCase
{
    use HasTestData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupTestData();
    }

    public function test_admin_can_list_obligations(): void
    {
        $this->createObligation($this->entreprise, 'Obligation 1');
        $this->createObligation($this->entreprise, 'Obligation 2');

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson('/api/obligations');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_user_can_list_obligations(): void
    {
        $this->createObligation($this->entreprise, 'Obligation 1');

        $this->actingAs($this->user, 'sanctum');
        $response = $this->getJson('/api/obligations');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_obligations_scoped_to_entreprise(): void
    {
        $this->createObligation($this->entreprise, 'Alpha');
        $this->createObligation($this->otherEntreprise, 'Beta');

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson('/api/obligations');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonFragment(['intitule' => 'Alpha']);
    }

    public function test_admin_can_create_obligation(): void
    {
        $this->actingAs($this->admin, 'sanctum');
        $response = $this->postJson('/api/obligations', [
            'intitule' => 'Nouvelle obligation',
            'date_echeance' => now()->addDays(60)->format('Y-m-d'),
            'commentaire' => 'Test commentaire',
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['intitule' => 'Nouvelle obligation']);

        $this->assertDatabaseHas('obligations', [
            'intitule' => 'Nouvelle obligation',
            'entreprise_id' => $this->entreprise->id,
        ]);
    }

    public function test_user_cannot_create_obligation(): void
    {
        $this->actingAs($this->user, 'sanctum');
        $response = $this->postJson('/api/obligations', [
            'intitule' => 'Forbidden',
            'date_echeance' => now()->addDays(60)->format('Y-m-d'),
        ]);

        $response->assertStatus(403);
    }

    public function test_create_sets_statut_expiree_for_past_date(): void
    {
        $this->actingAs($this->admin, 'sanctum');
        $this->postJson('/api/obligations', [
            'intitule' => 'Expirée',
            'date_echeance' => now()->subDays(5)->format('Y-m-d'),
        ]);

        $this->assertDatabaseHas('obligations', [
            'intitule' => 'Expirée',
            'statut' => 'expiree',
        ]);
    }

    public function test_create_sets_statut_proche_echeance(): void
    {
        $this->actingAs($this->admin, 'sanctum');
        $this->postJson('/api/obligations', [
            'intitule' => 'Bientôt',
            'date_echeance' => now()->addDays(15)->format('Y-m-d'),
        ]);

        $this->assertDatabaseHas('obligations', [
            'intitule' => 'Bientôt',
            'statut' => 'proche_echeance',
        ]);
    }

    public function test_create_sets_statut_a_jour(): void
    {
        $this->actingAs($this->admin, 'sanctum');
        $this->postJson('/api/obligations', [
            'intitule' => 'OK',
            'date_echeance' => now()->addMonths(6)->format('Y-m-d'),
        ]);

        $this->assertDatabaseHas('obligations', [
            'intitule' => 'OK',
            'statut' => 'a_jour',
        ]);
    }

    public function test_show_obligation(): void
    {
        $obligation = $this->createObligation($this->entreprise, 'Detail Me');

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson("/api/obligations/{$obligation->id}");

        $response->assertOk()
            ->assertJsonFragment(['intitule' => 'Detail Me']);
    }

    public function test_user_cannot_access_other_entreprise_obligation(): void
    {
        $obligation = $this->createObligation($this->otherEntreprise, 'Foreign');

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson("/api/obligations/{$obligation->id}");

        $response->assertNotFound();
    }

    public function test_admin_can_update_obligation(): void
    {
        $obligation = $this->createObligation($this->entreprise, 'Original');

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->putJson("/api/obligations/{$obligation->id}", [
            'intitule' => 'Updated',
            'date_echeance' => now()->addDays(10)->format('Y-m-d'),
        ]);

        $response->assertOk()
            ->assertJsonFragment(['intitule' => 'Updated']);
    }

    public function test_update_recalculates_statut(): void
    {
        $obligation = $this->createObligation($this->entreprise, 'Test', now()->addMonths(6)->format('Y-m-d'), 'a_jour');

        $this->actingAs($this->admin, 'sanctum');
        $this->putJson("/api/obligations/{$obligation->id}", [
            'date_echeance' => now()->subDays(10)->format('Y-m-d'),
        ]);

        $this->assertDatabaseHas('obligations', [
            'id' => $obligation->id,
            'statut' => 'expiree',
        ]);
    }

    public function test_user_cannot_update_obligation(): void
    {
        $obligation = $this->createObligation($this->entreprise, 'Nope');

        $this->actingAs($this->user, 'sanctum');
        $response = $this->putJson("/api/obligations/{$obligation->id}", [
            'intitule' => 'Hacked',
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_delete_obligation(): void
    {
        $obligation = $this->createObligation($this->entreprise, 'Doomed');

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->deleteJson("/api/obligations/{$obligation->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('obligations', ['id' => $obligation->id]);
    }

    public function test_user_cannot_delete_obligation(): void
    {
        $obligation = $this->createObligation($this->entreprise, 'Protected');

        $this->actingAs($this->user, 'sanctum');
        $response = $this->deleteJson("/api/obligations/{$obligation->id}");

        $response->assertStatus(403);
    }

    public function test_filter_by_statut(): void
    {
        $this->createObligation($this->entreprise, 'OK', now()->addMonths(6)->format('Y-m-d'), 'a_jour');
        $this->createObligation($this->entreprise, 'Late', now()->subDays(5)->format('Y-m-d'), 'expiree');

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson('/api/obligations?statut=expiree');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonFragment(['intitule' => 'Late']);
    }

    public function test_filter_by_search(): void
    {
        $this->createObligation($this->entreprise, 'Déclaration TVA');
        $this->createObligation($this->entreprise, 'Paie salariale');

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson('/api/obligations?search=TVA');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonFragment(['intitule' => 'Déclaration TVA']);
    }

    public function test_create_requires_intitule(): void
    {
        $this->actingAs($this->admin, 'sanctum');
        $response = $this->postJson('/api/obligations', [
            'date_echeance' => now()->addDays(30)->format('Y-m-d'),
        ]);

        $response->assertStatus(422);
    }

    public function test_create_with_category_id(): void
    {
        $category = $this->createCategory($this->entreprise, 'Fiscal');

        $this->actingAs($this->admin, 'sanctum');
        $this->postJson('/api/obligations', [
            'intitule' => 'Avec Catégorie',
            'date_echeance' => now()->addDays(30)->format('Y-m-d'),
            'categorie_id' => $category->id,
        ]);

        $this->assertDatabaseHas('obligations', [
            'intitule' => 'Avec Catégorie',
            'categorie_id' => $category->id,
        ]);
    }
}
