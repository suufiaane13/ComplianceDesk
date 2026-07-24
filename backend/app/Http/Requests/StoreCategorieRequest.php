<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategorieRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Category::class);
    }

    public function rules(): array
    {
        $entrepriseId = $this->user()->entreprise_id;

        return [
            'nom' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'nom')->where(fn ($q) => $q->where('entreprise_id', $entrepriseId)),
            ],
        ];
    }

    public function attributes(): array
    {
        return [
            'nom' => 'nom',
        ];
    }

    public function messages(): array
    {
        return [
            'nom.unique' => 'Cette catégorie existe déjà pour votre entreprise.',
        ];
    }
}
