<?php

namespace App\Http\Requests;

use App\Rules\MoroccanPhone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEntrepriseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('entreprise'));
    }

    public function rules(): array
    {
        $entreprise = $this->route('entreprise');

        return [
            'raison_sociale' => ['sometimes', 'string', 'max:255'],
            'secteur_activite' => ['nullable', 'string', 'max:255'],
            'adresse' => ['nullable', 'string'],
            'telephone' => ['nullable', 'string', 'max:50', new MoroccanPhone],
            'email' => [
                'nullable',
                'string',
                'email',
                'max:255',
                Rule::unique('entreprises', 'email')->ignore($entreprise->id),
            ],
        ];
    }

    public function attributes(): array
    {
        return [
            'raison_sociale' => 'raison sociale',
            'secteur_activite' => "secteur d'activité",
            'adresse' => 'adresse',
            'telephone' => 'téléphone',
            'email' => 'email',
        ];
    }
}
