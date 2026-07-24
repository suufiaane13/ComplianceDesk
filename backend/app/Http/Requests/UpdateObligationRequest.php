<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateObligationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('obligation'));
    }

    public function rules(): array
    {
        $entrepriseId = $this->user()->entreprise_id;

        return [
            'intitule' => ['sometimes', 'string', 'max:255'],
            'categorie' => ['nullable', 'string', 'max:255'],
            'categorie_id' => [
                'nullable',
                Rule::exists('categories', 'id')->where(fn ($q) => $q->where('entreprise_id', $entrepriseId)),
            ],
            'date_echeance' => ['sometimes', 'date'],
            'statut' => ['sometimes', 'in:a_jour,proche_echeance,expiree'],
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
            'statut' => 'statut',
            'commentaire' => 'commentaire',
        ];
    }
}
