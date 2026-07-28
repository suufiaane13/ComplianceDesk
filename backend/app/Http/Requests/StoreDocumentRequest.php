<?php

namespace App\Http\Requests;

use App\Models\Document;
use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', [Document::class, $this->route('obligation')]);
    }

    public function rules(): array
    {
        return [
            'nom_fichier' => ['required', 'string', 'max:255'],
            'type_document' => ['nullable', 'string', 'max:255'],
            // Limite métier PME : 10 Mo max, types restrictifs (PDF / Word / images).
            'fichier' => ['required', 'file', 'max:10240', 'mimes:pdf,doc,docx,png,jpg,jpeg'],
        ];
    }

    public function attributes(): array
    {
        return [
            'nom_fichier' => 'nom du fichier',
            'type_document' => 'type de document',
            'fichier' => 'fichier',
        ];
    }

    public function messages(): array
    {
        return [
            'fichier.mimes' => 'Le fichier doit être un PDF, Word (doc/docx) ou une image (png/jpg/jpeg).',
            'fichier.max' => 'Le fichier ne doit pas dépasser 10 Mo.',
        ];
    }
}
