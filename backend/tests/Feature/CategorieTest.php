<?php

namespace Tests\Feature;

use Tests\TestCase;
use Tests\Traits\HasTestData;

class CategorieTest extends TestCase
{
    use HasTestData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupTestData();
    }

    public function test_list_categories(): void
    {
        $this->createCategory($this->entreprise, 'Fiscal');
        $this->createCategory($this->entreprise, 'Social');

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson('/api/categories');

        $response->assertOk()
            ->assertJsonCount(2);
    }

    public function test_categories_scoped_to_entreprise(): void
    {
        $this->createCategory($this->entreprise, 'Alpha');
        $this->createCategory($this->otherEntreprise, 'Beta');

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson('/api/categories');

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['nom' => 'Alpha']);
    }

    public function test_categories_sorted_by_name(): void
    {
        $this->createCategory($this->entreprise, 'Zebra');
        $this->createCategory($this->entreprise, 'Alpha');

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson('/api/categories');

        $data = $response->json();
        $this->assertEquals('Alpha', $data[0]['nom']);
        $this->assertEquals('Zebra', $data[1]['nom']);
    }

    public function test_user_can_list_categories(): void
    {
        $this->createCategory($this->entreprise, 'Fiscal');

        $this->actingAs($this->user, 'sanctum');
        $response = $this->getJson('/api/categories');

        $response->assertOk()
            ->assertJsonCount(1);
    }

    public function test_admin_can_create_category(): void
    {
        $this->actingAs($this->admin, 'sanctum');
        $response = $this->postJson('/api/categories', [
            'nom' => 'Environnement',
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['nom' => 'Environnement']);

        $this->assertDatabaseHas('categories', [
            'nom' => 'Environnement',
            'entreprise_id' => $this->entreprise->id,
        ]);
    }

    public function test_user_cannot_create_category(): void
    {
        $this->actingAs($this->user, 'sanctum');
        $response = $this->postJson('/api/categories', [
            'nom' => 'Forbidden',
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_delete_category(): void
    {
        $category = $this->createCategory($this->entreprise, 'ToDelete');

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->deleteJson("/api/categories/{$category->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_user_cannot_delete_category(): void
    {
        $category = $this->createCategory($this->entreprise, 'Protected');

        $this->actingAs($this->user, 'sanctum');
        $response = $this->deleteJson("/api/categories/{$category->id}");

        $response->assertStatus(403);
    }

    public function test_cannot_delete_other_entreprise_category(): void
    {
        $category = $this->createCategory($this->otherEntreprise, 'Foreign');

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->deleteJson("/api/categories/{$category->id}");

        $response->assertNotFound();
    }

    public function test_create_requires_nom(): void
    {
        $this->actingAs($this->admin, 'sanctum');
        $response = $this->postJson('/api/categories', []);

        $response->assertStatus(422);
    }
}
