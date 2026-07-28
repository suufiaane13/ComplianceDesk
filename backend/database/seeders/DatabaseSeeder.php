<?php

namespace Database\Seeders;

use App\Models\Entreprise;
use App\Models\User;
use App\Models\Obligation;
use App\Models\Notification;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $entreprise = Entreprise::create([
            'raison_sociale' => 'ComplianceDesk Maroc',
            'secteur_activite' => 'Conseil en conformité',
            'adresse' => '123, Avenue Mohammed V, Oujda',
            'telephone' => '+212 5XX-XXXXXX',
            'email' => 'contact@compliancedesk.ma',
            'date_creation' => now(),
            'statut' => 'active',
        ]);

        $categoryNames = ['Assurance', 'CNSS', 'Santé', 'RH', 'Administratif', 'Juridique', 'Fiscal', 'Comptabilité'];
        $categories = [];
        foreach ($categoryNames as $name) {
            $categories[$name] = Category::create([
                'entreprise_id' => $entreprise->id,
                'nom' => $name,
            ]);
        }

        $admin = User::create([
            'entreprise_id' => $entreprise->id,
            'nom' => 'Admin',
            'prenom' => 'Entreprise',
            'email' => 'admin@compliancedesk.ma',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'date_creation' => now(),
        ]);

        // Déjà créé par la migration 2026_07_16_150100_seed_super_admin_user
        User::firstOrCreate(
            ['email' => 'superadmin@compliancedesk.ma'],
            [
                'entreprise_id' => null,
                'nom' => 'Super',
                'prenom' => 'Admin',
                'password' => Hash::make('password'),
                'role' => 'super_admin',
                'date_creation' => now(),
            ]
        );

        $user = User::create([
            'entreprise_id' => $entreprise->id,
            'nom' => 'User',
            'prenom' => 'Simple',
            'email' => 'user@compliancedesk.ma',
            'password' => Hash::make('password'),
            'role' => 'user',
            'date_creation' => now(),
        ]);

        $obligationsData = [
            ['Assurance Responsabilité Civile', 'Assurance', now()->addDays(45)],
            ['CNSS - Déclaration trimestrielle', 'CNSS', now()->addDays(15)],
            ['Médecine du travail - Visite annuelle', 'Santé', now()->addDays(60)],
            ['Registre du personnel - Mise à jour', 'RH', now()->addDays(90)],
            ['Contrat de travail - Nouvel embauché', 'RH', now()->addDays(5)],
            ['Autorisation administrative - Renouvellement', 'Administratif', now()->subDays(10)],
            ['Contrat fournisseur - Révision', 'Juridique', now()->addDays(120)],
            ['Déclaration fiscale annuelle', 'Fiscal', now()->addDays(180)],
            ['Bilan comptable', 'Comptabilité', now()->addDays(200)],
            ['Assurance multirisque', 'Assurance', now()->addDays(20)],
        ];

        $createdObligations = [];
        foreach ($obligationsData as [$intitule, $categorie, $dateEcheance]) {
            $now = now();
            $statut = 'a_jour';
            if ($dateEcheance < $now) {
                $statut = 'expiree';
            } elseif ($now->diffInDays($dateEcheance) <= 30) {
                $statut = 'proche_echeance';
            }

            $obligation = Obligation::create([
                'entreprise_id' => $entreprise->id,
                'intitule' => $intitule,
                'categorie' => $categorie,
                'categorie_id' => $categories[$categorie]->id ?? null,
                'date_creation' => $now,
                'date_echeance' => $dateEcheance,
                'statut' => $statut,
                'commentaire' => "Commentaire pour $intitule",
            ]);
            $createdObligations[] = $obligation;
        }

        foreach ($createdObligations as $ob) {
            Notification::create([
                'entreprise_id' => $entreprise->id,
                'utilisateur_id' => $admin->id,
                'obligation_id' => $ob->id,
                'type' => $ob->statut === 'expiree' ? 'expiree' : ($ob->statut === 'proche_echeance' ? 'echeance_proche' : 'echeance_proche'),
                'message' => "L'échéance « {$ob->intitule} » est prévue pour le {$ob->date_echeance->format('d/m/Y')}.",
                'date_creation' => now(),
                'lue' => false,
            ]);
        }
    }
}
