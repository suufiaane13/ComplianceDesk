<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreObligationRequest;
use App\Http\Requests\UpdateObligationRequest;
use App\Models\Obligation;
use App\Models\Notification;
use App\Services\ObligationStatusCalculator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ObligationController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Obligation::class);

        $obligations = Obligation::query();

        if ($request->statut) {
            $obligations = $obligations->where('statut', $request->statut);
        }

        if ($request->categorie) {
            $obligations = $obligations->where('categorie', $request->categorie);
        }

        if ($request->search) {
            $obligations = $obligations->where('intitule', 'like', '%'.$request->search.'%');
        }

        return $obligations->with(['documents', 'category'])->orderBy('date_echeance', 'asc')->paginate(perPage: $request->get('per_page', 20));
    }

    public function store(StoreObligationRequest $request)
    {
        $validated = $request->validated();
        $statut = ObligationStatusCalculator::fromDate($validated['date_echeance']);

        $obligation = Obligation::create([
            'entreprise_id' => $request->user()->entreprise_id,
            'intitule' => $validated['intitule'],
            'categorie' => $validated['categorie'] ?? null,
            'categorie_id' => $validated['categorie_id'] ?? null,
            'date_creation' => now(),
            'date_echeance' => $validated['date_echeance'],
            'statut' => $statut,
            'commentaire' => $validated['commentaire'] ?? null,
        ]);

        $this->createNotification($obligation, $statut);

        return response()->json($obligation->load('documents'), 201);
    }

    public function show(Obligation $obligation)
    {
        $this->authorize('view', $obligation);

        return $obligation->load(['documents', 'notifications', 'category']);
    }

    public function update(UpdateObligationRequest $request, Obligation $obligation)
    {
        $obligation->update($request->safe()->only([
            'intitule', 'categorie', 'categorie_id', 'date_echeance', 'commentaire',
        ]));

        $statut = ObligationStatusCalculator::fromDate($obligation->date_echeance);
        $obligation->update(['statut' => $statut]);

        return response()->json($obligation->load('documents'));
    }

    public function destroy(Obligation $obligation)
    {
        $this->authorize('delete', $obligation);

        foreach ($obligation->documents as $document) {
            if ($document->chemin_fichier) {
                Storage::disk('local')->delete($document->chemin_fichier);
            }
        }

        $obligation->notifications()->delete();
        $obligation->documents()->delete();
        $obligation->delete();

        return response()->json(['message' => 'Obligation supprimée']);
    }

    private function createNotification(Obligation $obligation, string $type): void
    {
        $message = '';

        switch ($type) {
            case 'proche_echeance':
                $message = "L'échéance « {$obligation->intitule} » approche. Date : {$obligation->date_echeance->format('d/m/Y')}";
                $type = 'echeance_proche';
                break;
            case 'expiree':
                $message = "L'échéance « {$obligation->intitule} » est dépassée.";
                break;
            default:
                return;
        }

        foreach ($obligation->entreprise->users as $utilisateur) {
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
