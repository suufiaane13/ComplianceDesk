<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocumentRequest;
use App\Models\Document;
use App\Models\Notification;
use App\Models\Obligation;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    private const DISK = 'local';

    public function index(Obligation $obligation)
    {
        $this->authorize('view', $obligation);

        return $obligation->documents()->orderBy('date_ajout', 'desc')->get();
    }

    public function store(StoreDocumentRequest $request, Obligation $obligation)
    {
        $validated = $request->validated();
        $fichier = $request->file('fichier')->store('documents', self::DISK);

        $document = Document::create([
            'obligation_id' => $obligation->id,
            'nom_fichier' => $validated['nom_fichier'],
            'type_document' => $validated['type_document'] ?? $request->file('fichier')->extension(),
            'date_ajout' => now(),
            'chemin_fichier' => $fichier,
        ]);

        $this->createNotification($obligation);

        return response()->json($document, 201);
    }

    public function download(Document $document)
    {
        $this->authorize('view', $document);

        if (!$document->chemin_fichier || !Storage::disk(self::DISK)->exists($document->chemin_fichier)) {
            abort(404, 'Fichier non trouvé');
        }

        return Storage::disk(self::DISK)->download($document->chemin_fichier, $document->nom_fichier);
    }

    public function destroy(Document $document)
    {
        $this->authorize('delete', $document);

        if ($document->chemin_fichier && Storage::disk(self::DISK)->exists($document->chemin_fichier)) {
            Storage::disk(self::DISK)->delete($document->chemin_fichier);
        }

        $document->delete();

        return response()->json(['message' => 'Document supprimé']);
    }

    private function createNotification(Obligation $obligation): void
    {
        foreach ($obligation->entreprise->users as $utilisateur) {
            if ($utilisateur->id === auth()->id()) {
                continue;
            }
            Notification::create([
                'entreprise_id' => $obligation->entreprise_id,
                'utilisateur_id' => $utilisateur->id,
                'obligation_id' => $obligation->id,
                'type' => 'document_ajoute',
                'message' => "Un nouveau document a été ajouté à l'obligation « {$obligation->intitule} »",
                'date_creation' => now(),
                'lue' => false,
            ]);
        }
    }
}
