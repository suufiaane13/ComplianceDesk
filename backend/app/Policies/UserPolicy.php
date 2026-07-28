<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $this->viewAny($user);
    }

    public function update(User $user, User $model): bool
    {
        if ($model->isSuperAdmin()) {
            return false;
        }

        return $user->isAdmin()
            && $user->entreprise_id
            && $user->entreprise_id === $model->entreprise_id;
    }

    public function delete(User $user, User $model): bool
    {
        return $this->update($user, $model);
    }
}
