<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Entreprise extends Model
{
    protected $fillable = [
        'raison_sociale',
        'secteur_activite',
        'adresse',
        'telephone',
        'email',
        'date_creation',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'date_creation' => 'date',
        ];
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function obligations()
    {
        return $this->hasMany(Obligation::class);
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}
