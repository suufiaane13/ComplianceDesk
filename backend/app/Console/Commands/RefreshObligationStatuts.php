<?php

namespace App\Console\Commands;

use App\Models\Notification;
use App\Models\Obligation;
use App\Services\ObligationStatusCalculator;
use Illuminate\Console\Command;

class RefreshObligationStatuts extends Command
{
    protected $signature = 'obligations:refresh-statuts';

    protected $description = 'Recalcule les statuts des obligations selon leur date d\'échéance';

    public function handle(): int
    {
        $updated = 0;

        Obligation::withoutGlobalScopes()->with('entreprise.users')->chunkById(100, function ($obligations) use (&$updated) {
            foreach ($obligations as $obligation) {
                $newStatut = ObligationStatusCalculator::fromDate($obligation->date_echeance);
                if ($obligation->statut === $newStatut) {
                    continue;
                }

                $previous = $obligation->statut;
                $obligation->update(['statut' => $newStatut]);
                $updated++;

                if (in_array($newStatut, [ObligationStatusCalculator::PROCHE_ECHEANCE, ObligationStatusCalculator::EXPIREE], true)
                    && $previous !== $newStatut) {
                    $this->notifyTransition($obligation, $newStatut);
                }
            }
        });

        $this->info("{$updated} obligation(s) mise(s) à jour.");

        return self::SUCCESS;
    }

    private function notifyTransition(Obligation $obligation, string $statut): void
    {
        if ($statut === ObligationStatusCalculator::PROCHE_ECHEANCE) {
            $type = 'echeance_proche';
            $message = "L'échéance « {$obligation->intitule} » approche. Date : {$obligation->date_echeance->format('d/m/Y')}";
        } else {
            $type = 'expiree';
            $message = "L'échéance « {$obligation->intitule} » est dépassée.";
        }

        foreach ($obligation->entreprise?->users ?? [] as $utilisateur) {
            Notification::create([
                'entreprise_id' => $obligation->entreprise_id,
                'utilisateur_id' => $utilisateur->id,
                'obligation_id' => $obligation->id,
                'type' => $type,
                'message' => $message,
                'date_creation' => now(),
                'lue' => false,
            ]);
        }
    }
}
