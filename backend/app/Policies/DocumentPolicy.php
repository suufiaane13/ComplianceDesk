<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\Obligation;
use App\Models\User;

class DocumentPolicy
{
    public function viewAny(User $user, Obligation $obligation): bool
    {
        return $user->isTenantMember()
            && $user->entreprise_id === $obligation->entreprise_id;
    }

    public function view(User $user, Document $document): bool
    {
        $obligation = $document->obligation;

        return $obligation
            && $user->isTenantMember()
            && $user->entreprise_id === $obligation->entreprise_id;
    }

    public function create(User $user, Obligation $obligation): bool
    {
        return $this->viewAny($user, $obligation);
    }

    public function delete(User $user, Document $document): bool
    {
        return $user->isAdmin() && $this->view($user, $document);
    }
}
