<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'entreprise_id',
        'utilisateur_id',
        'obligation_id',
        'type',
        'message',
        'date_creation',
        'lue',
    ];

    protected function casts(): array
    {
        return [
            'date_creation' => 'date',
            'lue' => 'boolean',
        ];
    }

    public function entreprise()
    {
        return $this->belongsTo(Entreprise::class);
    }

    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'utilisateur_id');
    }

    public function obligation()
    {
        return $this->belongsTo(Obligation::class);
    }
}
