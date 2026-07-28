<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTenantUserRequest;
use App\Http\Requests\UpdateTenantUserRequest;
use App\Models\User;
use App\Services\ComplianceMailer;

class UserController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', User::class);

        return User::query()
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function store(StoreTenantUserRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();

        $newUser = User::create([
            'entreprise_id' => $user->entreprise_id,
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => $validated['role'] ?? User::ROLE_USER,
            'date_creation' => now()->format('Y-m-d'),
        ]);

        ComplianceMailer::sendAccountCreated($newUser);

        return response()->json($newUser, 201);
    }

    public function update(UpdateTenantUserRequest $request, User $user)
    {
        $this->authorize('update', $user);

        $validated = $request->validated();
        unset($validated['entreprise_id']);

        if (array_key_exists('password', $validated) && empty($validated['password'])) {
            unset($validated['password']);
        }

        if (
            $user->isAdmin()
            && array_key_exists('role', $validated)
            && $validated['role'] !== User::ROLE_ADMIN
        ) {
            $adminCount = User::where('role', User::ROLE_ADMIN)->count();

            if ($adminCount <= 1) {
                abort(400, 'Impossible de rétrograder le dernier administrateur de l\'entreprise.');
            }
        }

        $user->update($validated);

        if (array_key_exists('password', $validated)) {
            $user->tokens()->delete();
        }

        return response()->json($user);
    }

    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        if ($user->id === auth()->id()) {
            abort(400, 'Vous ne pouvez pas supprimer votre propre compte.');
        }

        if ($user->isAdmin()) {
            $adminCount = User::where('role', User::ROLE_ADMIN)->count();

            if ($adminCount <= 1) {
                abort(400, 'Impossible de supprimer le dernier administrateur de l\'entreprise.');
            }
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé.']);
    }
}
