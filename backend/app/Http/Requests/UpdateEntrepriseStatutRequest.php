<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEntrepriseStatutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('updateStatut', $this->route('entreprise'));
    }

    public function rules(): array
    {
        return [
            'statut' => ['required', 'in:active,suspendue'],
        ];
    }

    public function attributes(): array
    {
        return [
            'statut' => 'statut',
        ];
    }
}
