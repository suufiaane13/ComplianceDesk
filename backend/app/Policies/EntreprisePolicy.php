<?php

namespace App\Policies;

use App\Models\Entreprise;
use App\Models\User;

class EntreprisePolicy
{
    public function viewAny(User $user): bool
    {
        // Tout utilisateur authentifié peut lister (filtrage tenant côté contrôleur).
        return $user->exists;
    }

    public function view(User $user, Entreprise $entreprise): bool
    {
        return $user->isSuperAdmin() || $user->entreprise_id === $entreprise->id;
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function update(User $user, Entreprise $entreprise): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->isAdmin() && $user->entreprise_id === $entreprise->id;
    }

    public function updateStatut(User $user, Entreprise $entreprise): bool
    {
        // Le modèle est requis par la signature Gate ; on vérifie qu'il est résolu.
        return $user->isSuperAdmin() && $entreprise->exists;
    }

    public function manageUsers(User $user, Entreprise $entreprise): bool
    {
        return $this->update($user, $entreprise);
    }
}
