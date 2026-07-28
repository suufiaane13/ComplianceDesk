<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateTenantUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        $entreprise = $this->route('entreprise');
        if ($entreprise) {
            return $this->user()->can('manageUsers', $entreprise);
        }

        return $this->user()->can('update', $this->route('user'));
    }

    public function rules(): array
    {
        $user = $this->route('user');

        return [
            'nom' => ['sometimes', 'required', 'string', 'max:255'],
            'prenom' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'role' => ['sometimes', 'required', 'in:admin,user'],
            'password' => ['nullable', 'string', Password::defaults()],
        ];
    }

    public function attributes(): array
    {
        return [
            'nom' => 'nom',
            'prenom' => 'prénom',
            'email' => 'email',
            'role' => 'rôle',
            'password' => 'mot de passe',
        ];
    }
}
