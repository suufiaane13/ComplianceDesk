<?php

namespace App\Http\Requests;

use App\Models\Obligation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreObligationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Obligation::class);
    }

    public function rules(): array
    {
        $entrepriseId = $this->user()->entreprise_id;

        return [
            'intitule' => ['required', 'string', 'max:255'],
            'categorie' => ['nullable', 'string', 'max:255'],
            'categorie_id' => [
                'nullable',
                Rule::exists('categories', 'id')->where(fn ($q) => $q->where('entreprise_id', $entrepriseId)),
            ],
            'date_echeance' => ['required', 'date'],
            'commentaire' => ['nullable', 'string'],
        ];
    }

    public function attributes(): array
    {
        return [
            'intitule' => 'intitulé',
            'categorie' => 'catégorie',
            'categorie_id' => 'catégorie',
            'date_echeance' => "date d'échéance",
            'commentaire' => 'commentaire',
        ];
    }
}
