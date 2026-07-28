<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = [
        'obligation_id',
        'nom_fichier',
        'type_document',
        'date_ajout',
        'chemin_fichier',
    ];

    protected function casts(): array
    {
        return [
            'date_ajout' => 'date',
        ];
    }

    public function obligation()
    {
        return $this->belongsTo(Obligation::class);
    }
}
