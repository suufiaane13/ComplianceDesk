<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use BelongsToTenant;

    protected $fillable = ['entreprise_id', 'nom'];

    public function entreprise()
    {
        return $this->belongsTo(Entreprise::class);
    }

    public function obligations()
    {
        return $this->hasMany(Obligation::class, 'categorie_id');
    }
}
