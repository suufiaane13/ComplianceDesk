<?php

namespace App\Policies;

use App\Models\Obligation;
use App\Models\User;

class ObligationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isTenantMember();
    }

    public function view(User $user, Obligation $obligation): bool
    {
        return $user->isTenantMember()
            && $user->entreprise_id === $obligation->entreprise_id;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Obligation $obligation): bool
    {
        return $user->isAdmin()
            && $user->entreprise_id === $obligation->entreprise_id;
    }

    public function delete(User $user, Obligation $obligation): bool
    {
        return $this->update($user, $obligation);
    }
}
