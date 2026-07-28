<?php

namespace Tests\Traits;

use App\Models\Entreprise;
use App\Models\User;
use App\Models\Obligation;
use App\Models\Category;
use App\Models\Notification;
use App\Models\Document;

trait HasTestData
{
    protected Entreprise $entreprise;
    protected Entreprise $otherEntreprise;
    protected User $admin;
    protected User $user;

    protected function createEntreprise(string $name = 'Entreprise Test'): Entreprise
    {
        return Entreprise::create([
            'raison_sociale' => $name,
            'secteur_activite' => 'Informatique',
            'adresse' => '123 Rue Test, Oujda',
            'telephone' => '0522000000',
            'email' => strtolower(str_replace(' ', '.', $name)) . '@test.ma',
            'date_creation' => now(),
            'statut' => 'active',
        ]);
    }

    protected function createSuperAdmin(string $email = 'superadmin@test.ma'): User
    {
        return User::create([
            'entreprise_id' => null,
            'nom' => 'Super',
            'prenom' => 'Admin',
            'email' => $email,
            'password' => 'password123',
            'role' => 'super_admin',
            'date_creation' => now(),
        ]);
    }

    protected function createAdmin(Entreprise $entreprise): User
    {
        return User::create([
            'entreprise_id' => $entreprise->id,
            'nom' => 'Admin',
            'prenom' => 'Test',
            'email' => 'admin@test.ma',
            'password' => 'password123',
            'role' => 'admin',
            'date_creation' => now(),
        ]);
    }

    protected function createUser(Entreprise $entreprise, string $email = 'user@test.ma'): User
    {
        return User::create([
            'entreprise_id' => $entreprise->id,
            'nom' => 'User',
            'prenom' => 'Test',
            'email' => $email,
            'password' => 'password123',
            'role' => 'user',
            'date_creation' => now(),
        ]);
    }

    protected function createObligation(
        Entreprise $entreprise,
        string $intitule = 'Test Obligation',
        string $dateEcheance = null,
        string $statut = 'a_jour'
    ): Obligation {
        return Obligation::create([
            'entreprise_id' => $entreprise->id,
            'intitule' => $intitule,
            'categorie' => 'Fiscal',
            'date_creation' => now(),
            'date_echeance' => $dateEcheance ?? now()->addMonths(3)->format('Y-m-d'),
            'statut' => $statut,
        ]);
    }

    protected function createCategory(Entreprise $entreprise, string $nom = 'Fiscal'): Category
    {
        return Category::create([
            'entreprise_id' => $entreprise->id,
            'nom' => $nom,
        ]);
    }

    protected function createNotification(
        User $user,
        Obligation $obligation,
        string $type = 'echeance_proche',
        bool $lue = false
    ): Notification {
        return Notification::create([
            'entreprise_id' => $user->entreprise_id,
            'utilisateur_id' => $user->id,
            'obligation_id' => $obligation->id,
            'type' => $type,
            'message' => 'Test notification',
            'date_creation' => now(),
            'lue' => $lue,
        ]);
    }

    protected function setupTestData(): void
    {
        $this->entreprise = $this->createEntreprise('Entreprise Alpha');
        $this->otherEntreprise = $this->createEntreprise('Entreprise Beta');
        $this->admin = $this->createAdmin($this->entreprise);
        $this->user = $this->createUser($this->entreprise);
    }

}
