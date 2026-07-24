<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Obligation extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'entreprise_id',
        'intitule',
        'categorie',
        'categorie_id',
        'date_creation',
        'date_echeance',
        'statut',
        'commentaire',
    ];

    protected function casts(): array
    {
        return [
            'date_creation' => 'date',
            'date_echeance' => 'date',
        ];
    }

    public function entreprise()
    {
        return $this->belongsTo(Entreprise::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'categorie_id');
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}
