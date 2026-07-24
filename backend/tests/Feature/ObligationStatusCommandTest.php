<?php

namespace Tests\Feature;

use App\Models\Obligation;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;
use Tests\Traits\HasTestData;

class ObligationStatusCommandTest extends TestCase
{
    use HasTestData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupTestData();
    }

    public function test_refresh_command_updates_stale_statuts(): void
    {
        $expired = Obligation::create([
            'entreprise_id' => $this->entreprise->id,
            'intitule' => 'Déjà expirée',
            'categorie' => 'Fiscal',
            'date_creation' => now()->subMonths(2),
            'date_echeance' => now()->subDays(5)->format('Y-m-d'),
            'statut' => 'a_jour',
        ]);

        $proche = Obligation::create([
            'entreprise_id' => $this->entreprise->id,
            'intitule' => 'Bientôt due',
            'categorie' => 'Fiscal',
            'date_creation' => now(),
            'date_echeance' => now()->addDays(10)->format('Y-m-d'),
            'statut' => 'a_jour',
        ]);

        Artisan::call('obligations:refresh-statuts');

        $this->assertEquals('expiree', $expired->fresh()->statut);
        $this->assertEquals('proche_echeance', $proche->fresh()->statut);
    }
}
