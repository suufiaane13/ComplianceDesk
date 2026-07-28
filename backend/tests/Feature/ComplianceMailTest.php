<?php

namespace Tests\Feature;

use App\Mail\AccountCreatedMail;
use App\Mail\EntrepriseSuspendedMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;
use Tests\Traits\HasTestData;

class ComplianceMailTest extends TestCase
{
    use HasTestData;

    protected User $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupTestData();
        $this->superAdmin = $this->createSuperAdmin();
        Mail::fake();
    }

    public function test_creating_user_queues_account_created_mail_without_password(): void
    {
        $this->actingAs($this->admin, 'sanctum');

        $response = $this->postJson('/api/users', [
            'nom' => 'Alaoui',
            'prenom' => 'Yasmine',
            'email' => 'yasmine.mail@test.ma',
            'password' => 'password123',
            'role' => 'user',
        ]);

        $response->assertStatus(201);

        Mail::assertQueued(AccountCreatedMail::class, function (AccountCreatedMail $mail) {
            return $mail->user->email === 'yasmine.mail@test.ma'
                && str_contains($mail->setPasswordUrl, 'set-password')
                && $mail->hasTo('yasmine.mail@test.ma');
        });
    }

    public function test_creating_entreprise_queues_account_created_mail_to_admin(): void
    {
        $this->actingAs($this->superAdmin, 'sanctum');

        $response = $this->postJson('/api/entreprises', [
            'raison_sociale' => 'Mail PME',
            'email' => 'contact-mail@pme.ma',
            'admin' => [
                'nom' => 'Benali',
                'prenom' => 'Sara',
                'email' => 'sara.mail@pme.ma',
                'password' => 'password123',
            ],
        ]);

        $response->assertStatus(201);

        Mail::assertQueued(AccountCreatedMail::class, function (AccountCreatedMail $mail) {
            return $mail->hasTo('sara.mail@pme.ma')
                && str_contains($mail->setPasswordUrl, 'set-password');
        });
    }

    public function test_suspending_entreprise_queues_mail_to_tenant_admins(): void
    {
        $this->actingAs($this->superAdmin, 'sanctum');

        $response = $this->patchJson("/api/entreprises/{$this->entreprise->id}/statut", [
            'statut' => 'suspendue',
        ]);

        $response->assertOk();

        Mail::assertQueued(EntrepriseSuspendedMail::class, function (EntrepriseSuspendedMail $mail) {
            return $mail->hasTo($this->admin->email)
                && $mail->entreprise->id === $this->entreprise->id;
        });
    }

    public function test_reactivating_entreprise_does_not_send_suspended_mail(): void
    {
        $this->entreprise->update(['statut' => 'suspendue']);
        Mail::fake();

        $this->actingAs($this->superAdmin, 'sanctum');

        $this->patchJson("/api/entreprises/{$this->entreprise->id}/statut", [
            'statut' => 'active',
        ])->assertOk();

        Mail::assertNothingOutgoing();
    }

    public function test_set_password_with_valid_token(): void
    {
        $token = Password::broker()->createToken($this->user);

        $response = $this->postJson('/api/password/set', [
            'email' => $this->user->email,
            'token' => $token,
            'password' => 'newpass1234',
            'password_confirmation' => 'newpass1234',
        ]);

        $response->assertOk();

        $this->postJson('/api/login', [
            'email' => $this->user->email,
            'password' => 'newpass1234',
        ])->assertOk();
    }
}
