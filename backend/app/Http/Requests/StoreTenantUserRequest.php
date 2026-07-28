<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Validator;

class StoreTenantUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        $entreprise = $this->route('entreprise');
        if ($entreprise) {
            return $this->user()->can('manageUsers', $entreprise);
        }

        return $this->user()->can('create', User::class);
    }

    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', Password::defaults()],
            'role' => ['sometimes', 'in:admin,user'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($this->input('role') === User::ROLE_SUPER_ADMIN) {
                $validator->errors()->add('role', 'Impossible de créer un super administrateur.');
            }
        });
    }

    public function attributes(): array
    {
        return [
            'nom' => 'nom',
            'prenom' => 'prénom',
            'email' => 'email',
            'password' => 'mot de passe',
            'role' => 'rôle',
        ];
    }
}
