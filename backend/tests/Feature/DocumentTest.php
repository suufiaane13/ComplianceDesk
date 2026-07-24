<?php

namespace Tests\Feature;

use Tests\TestCase;
use Tests\Traits\HasTestData;
use App\Models\Document;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class DocumentTest extends TestCase
{
    use HasTestData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupTestData();
        Storage::fake('local');
    }

    public function test_admin_can_upload_document(): void
    {
        $obligation = $this->createObligation($this->entreprise);

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->postJson("/api/obligations/{$obligation->id}/documents", [
            'nom_fichier' => 'PV conformité.pdf',
            'type_document' => 'pdf',
            'fichier' => UploadedFile::fake()->create('document.pdf', 100, 'application/pdf'),
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['nom_fichier' => 'PV conformité.pdf']);
    }

    public function test_user_can_upload_document(): void
    {
        $obligation = $this->createObligation($this->entreprise);

        $this->actingAs($this->user, 'sanctum');
        $response = $this->postJson("/api/obligations/{$obligation->id}/documents", [
            'nom_fichier' => 'doc.pdf',
            'type_document' => 'pdf',
            'fichier' => UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf'),
        ]);

        $response->assertStatus(201);
    }

    public function test_upload_stores_file_record(): void
    {
        $obligation = $this->createObligation($this->entreprise);

        $this->actingAs($this->admin, 'sanctum');
        $this->postJson("/api/obligations/{$obligation->id}/documents", [
            'nom_fichier' => 'rapport.pdf',
            'fichier' => UploadedFile::fake()->create('rapport.pdf', 50, 'application/pdf'),
        ]);

        $this->assertDatabaseHas('documents', [
            'obligation_id' => $obligation->id,
            'nom_fichier' => 'rapport.pdf',
        ]);
    }

    public function test_upload_creates_notification_for_other_users(): void
    {
        $obligation = $this->createObligation($this->entreprise);

        $this->actingAs($this->admin, 'sanctum');
        $this->postJson("/api/obligations/{$obligation->id}/documents", [
            'nom_fichier' => 'notify.pdf',
            'fichier' => UploadedFile::fake()->create('notify.pdf', 50, 'application/pdf'),
        ]);

        $this->assertDatabaseHas('notifications', [
            'utilisateur_id' => $this->user->id,
            'type' => 'document_ajoute',
        ]);
    }

    public function test_upload_does_not_notify_uploader(): void
    {
        $obligation = $this->createObligation($this->entreprise);

        $this->actingAs($this->admin, 'sanctum');
        $this->postJson("/api/obligations/{$obligation->id}/documents", [
            'nom_fichier' => 'self.pdf',
            'fichier' => UploadedFile::fake()->create('self.pdf', 50, 'application/pdf'),
        ]);

        $this->assertDatabaseMissing('notifications', [
            'utilisateur_id' => $this->admin->id,
            'type' => 'document_ajoute',
        ]);
    }

    public function test_cannot_upload_to_other_entreprise_obligation(): void
    {
        $obligation = $this->createObligation($this->otherEntreprise, 'Foreign');

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->postJson("/api/obligations/{$obligation->id}/documents", [
            'nom_fichier' => 'hack.pdf',
            'fichier' => UploadedFile::fake()->create('hack.pdf', 50, 'application/pdf'),
        ]);

        $response->assertNotFound();
    }

    public function test_list_documents(): void
    {
        $obligation = $this->createObligation($this->entreprise);
        Document::create([
            'obligation_id' => $obligation->id,
            'nom_fichier' => 'doc1.pdf',
            'type_document' => 'pdf',
            'date_ajout' => now(),
            'chemin_fichier' => 'documents/doc1.pdf',
        ]);

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson("/api/obligations/{$obligation->id}/documents");

        $response->assertOk()
            ->assertJsonCount(1);
    }

    public function test_admin_can_delete_document(): void
    {
        $obligation = $this->createObligation($this->entreprise);
        $document = Document::create([
            'obligation_id' => $obligation->id,
            'nom_fichier' => 'deleteme.pdf',
            'type_document' => 'pdf',
            'date_ajout' => now(),
            'chemin_fichier' => 'documents/deleteme.pdf',
        ]);

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->deleteJson("/api/documents/{$document->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('documents', ['id' => $document->id]);
    }

    public function test_user_cannot_delete_document(): void
    {
        $obligation = $this->createObligation($this->entreprise);
        $document = Document::create([
            'obligation_id' => $obligation->id,
            'nom_fichier' => 'protected.pdf',
            'type_document' => 'pdf',
            'date_ajout' => now(),
            'chemin_fichier' => 'documents/protected.pdf',
        ]);

        $this->actingAs($this->user, 'sanctum');
        $response = $this->deleteJson("/api/documents/{$document->id}");

        $response->assertStatus(403);
    }

    public function test_cannot_delete_other_entreprise_document(): void
    {
        $obligation = $this->createObligation($this->otherEntreprise);
        $document = Document::create([
            'obligation_id' => $obligation->id,
            'nom_fichier' => 'foreign.pdf',
            'type_document' => 'pdf',
            'date_ajout' => now(),
            'chemin_fichier' => 'documents/foreign.pdf',
        ]);

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->deleteJson("/api/documents/{$document->id}");

        $response->assertStatus(403);
    }

    public function test_upload_validates_required_fields(): void
    {
        $obligation = $this->createObligation($this->entreprise);

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->postJson("/api/obligations/{$obligation->id}/documents", []);

        $response->assertStatus(422);
    }

    public function test_upload_stores_file_on_private_disk(): void
    {
        $obligation = $this->createObligation($this->entreprise);

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->postJson("/api/obligations/{$obligation->id}/documents", [
            'nom_fichier' => 'prive.pdf',
            'fichier' => UploadedFile::fake()->create('prive.pdf', 50, 'application/pdf'),
        ]);

        $response->assertStatus(201);
        $path = $response->json('chemin_fichier');
        $this->assertNotEmpty($path);
        Storage::disk('local')->assertExists($path);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_member_can_download_own_document(): void
    {
        $obligation = $this->createObligation($this->entreprise);
        $file = UploadedFile::fake()->create('dl.pdf', 50, 'application/pdf');
        $path = $file->store('documents', 'local');

        $document = Document::create([
            'obligation_id' => $obligation->id,
            'nom_fichier' => 'dl.pdf',
            'type_document' => 'pdf',
            'date_ajout' => now(),
            'chemin_fichier' => $path,
        ]);

        $this->actingAs($this->user, 'sanctum');
        $response = $this->get("/api/documents/{$document->id}/download");

        $response->assertOk();
    }

    public function test_cannot_download_other_entreprise_document(): void
    {
        $obligation = $this->createObligation($this->otherEntreprise);
        $file = UploadedFile::fake()->create('secret.pdf', 50, 'application/pdf');
        $path = $file->store('documents', 'local');

        $document = Document::create([
            'obligation_id' => $obligation->id,
            'nom_fichier' => 'secret.pdf',
            'type_document' => 'pdf',
            'date_ajout' => now(),
            'chemin_fichier' => $path,
        ]);

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->get("/api/documents/{$document->id}/download");

        $response->assertStatus(403);
    }

}
