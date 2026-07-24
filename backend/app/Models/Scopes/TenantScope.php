<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $user = auth()->user();

        if ($user && $user->isTenantMember() && $user->entreprise_id) {
            $builder->where($model->getTable().'.entreprise_id', $user->entreprise_id);
        }
    }
}
