<?php

namespace App\Http\Requests;

use App\Rules\MoroccanPhone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreEntrepriseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Entreprise::class);
    }

    public function rules(): array
    {
        return [
            'raison_sociale' => ['required', 'string', 'max:255'],
            'secteur_activite' => ['nullable', 'string', 'max:255'],
            'adresse' => ['nullable', 'string'],
            'telephone' => ['nullable', 'string', 'max:50', new MoroccanPhone],
            'email' => ['nullable', 'string', 'email', 'max:255', 'unique:entreprises'],
            'admin' => ['required', 'array'],
            'admin.nom' => ['required', 'string', 'max:255'],
            'admin.prenom' => ['required', 'string', 'max:255'],
            'admin.email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'admin.password' => ['required', 'string', Password::defaults()],
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
            'admin.nom' => "nom de l'administrateur",
            'admin.prenom' => "prénom de l'administrateur",
            'admin.email' => "email de l'administrateur",
            'admin.password' => "mot de passe de l'administrateur",
        ];
    }
}
