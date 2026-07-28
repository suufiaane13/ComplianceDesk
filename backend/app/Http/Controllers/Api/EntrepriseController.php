<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEntrepriseAdminRequest;
use App\Http\Requests\StoreEntrepriseRequest;
use App\Http\Requests\StoreTenantUserRequest;
use App\Http\Requests\UpdateEntrepriseRequest;
use App\Http\Requests\UpdateEntrepriseStatutRequest;
use App\Http\Requests\UpdateTenantUserRequest;
use App\Models\Entreprise;
use App\Models\User;
use App\Services\ComplianceMailer;
use App\Services\PlatformNotifier;
use Illuminate\Support\Facades\DB;

class EntrepriseController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Entreprise::class);

        $user = auth()->user();

        if ($user->isSuperAdmin()) {
            return Entreprise::withCount('users', 'obligations')
                ->orderBy('raison_sociale')
                ->get();
        }

        return Entreprise::where('id', $user->entreprise_id)
            ->withCount('users', 'obligations')
            ->get();
    }

    public function store(StoreEntrepriseRequest $request)
    {
        $validated = $request->validated();

        $result = DB::transaction(function () use ($validated) {
            $entreprise = Entreprise::create([
                'raison_sociale' => $validated['raison_sociale'],
                'secteur_activite' => $validated['secteur_activite'] ?? null,
                'adresse' => $validated['adresse'] ?? null,
                'telephone' => $validated['telephone'] ?? null,
                'email' => $validated['email'] ?? null,
                'date_creation' => now(),
                'statut' => 'active',
            ]);

            $admin = User::create([
                'entreprise_id' => $entreprise->id,
                'nom' => $validated['admin']['nom'],
                'prenom' => $validated['admin']['prenom'],
                'email' => $validated['admin']['email'],
                'password' => $validated['admin']['password'],
                'role' => User::ROLE_ADMIN,
                'date_creation' => now()->format('Y-m-d'),
            ]);

            return [$entreprise, $admin];
        });

        [$entreprise, $admin] = $result;

        PlatformNotifier::notifySuperAdmins(
            'entreprise_creee',
            "Nouvelle entreprise « {$entreprise->raison_sociale} » créée (admin : {$admin->prenom} {$admin->nom}).",
            $entreprise
        );

        ComplianceMailer::sendAccountCreated($admin);

        return response()->json([
            'entreprise' => $entreprise->loadCount('users', 'obligations'),
            'admin' => $admin,
        ], 201);
    }

    public function show(Entreprise $entreprise)
    {
        $this->authorize('view', $entreprise);

        return $entreprise->load(['users', 'obligations']);
    }

    public function update(UpdateEntrepriseRequest $request, Entreprise $entreprise)
    {
        $entreprise->update($request->validated());

        return response()->json($entreprise);
    }

    public function updateStatut(UpdateEntrepriseStatutRequest $request, Entreprise $entreprise)
    {
        $validated = $request->validated();
        $entreprise->update(['statut' => $validated['statut']]);

        $type = $validated['statut'] === 'suspendue' ? 'entreprise_suspendue' : 'entreprise_activee';
        $action = $validated['statut'] === 'suspendue' ? 'suspendue' : 'réactivée';
        PlatformNotifier::notifySuperAdmins(
            $type,
            "L'entreprise « {$entreprise->raison_sociale} » a été {$action}.",
            $entreprise
        );

        if ($validated['statut'] === 'suspendue') {
            User::withoutGlobalScopes()
                ->where('entreprise_id', $entreprise->id)
                ->each(function (User $tenantUser) {
                    $tenantUser->tokens()->delete();
                });
            ComplianceMailer::sendEntrepriseSuspended($entreprise);
        }

        return response()->json($entreprise->loadCount('users', 'obligations'));
    }

    public function addAdmin(StoreEntrepriseAdminRequest $request, Entreprise $entreprise)
    {
        $validated = $request->validated();

        $admin = User::create([
            'entreprise_id' => $entreprise->id,
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => User::ROLE_ADMIN,
            'date_creation' => now()->format('Y-m-d'),
        ]);

        PlatformNotifier::notifySuperAdmins(
            'admin_ajoute',
            "Administrateur {$admin->prenom} {$admin->nom} ajouté à « {$entreprise->raison_sociale} ».",
            $entreprise
        );

        ComplianceMailer::sendAccountCreated($admin);

        return response()->json($admin, 201);
    }

    public function users(Entreprise $entreprise)
    {
        $this->authorize('view', $entreprise);

        return $entreprise->users()->orderBy('created_at', 'desc')->get();
    }

    public function addUser(StoreTenantUserRequest $request, Entreprise $entreprise)
    {
        $validated = $request->validated();

        $user = User::create([
            'entreprise_id' => $entreprise->id,
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => $validated['role'] ?? User::ROLE_USER,
            'date_creation' => now()->format('Y-m-d'),
        ]);

        ComplianceMailer::sendAccountCreated($user);

        return response()->json($user, 201);
    }

    public function updateUser(UpdateTenantUserRequest $request, Entreprise $entreprise, User $user)
    {
        $this->assertUserBelongsToEntreprise($entreprise, $user);

        if ($user->isSuperAdmin()) {
            abort(403, 'Impossible de modifier un super administrateur.');
        }

        $validated = $request->validated();

        if (array_key_exists('password', $validated) && empty($validated['password'])) {
            unset($validated['password']);
        }

        if (
            $user->isAdmin()
            && array_key_exists('role', $validated)
            && $validated['role'] !== User::ROLE_ADMIN
        ) {
            $this->assertNotLastAdmin($entreprise, $user);
        }

        $user->update($validated);

        if (array_key_exists('password', $validated)) {
            $user->tokens()->delete();
        }

        return response()->json($user);
    }

    public function destroyUser(Entreprise $entreprise, User $user)
    {
        $this->authorize('manageUsers', $entreprise);
        $this->assertUserBelongsToEntreprise($entreprise, $user);

        if ($user->id === auth()->id()) {
            abort(400, 'Vous ne pouvez pas supprimer votre propre compte.');
        }

        if ($user->isSuperAdmin()) {
            abort(403, 'Impossible de supprimer un super administrateur.');
        }

        $this->assertNotLastAdmin($entreprise, $user);

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé.']);
    }

    private function assertNotLastAdmin(Entreprise $entreprise, User $user): void
    {
        if (!$user->isAdmin()) {
            return;
        }

        $adminCount = User::withoutGlobalScopes()
            ->where('entreprise_id', $entreprise->id)
            ->where('role', User::ROLE_ADMIN)
            ->count();

        if ($adminCount <= 1) {
            abort(400, 'Impossible de retirer le dernier administrateur de l\'entreprise.');
        }
    }

    private function assertUserBelongsToEntreprise(Entreprise $entreprise, User $user): void
    {
        if ($user->entreprise_id !== $entreprise->id) {
            abort(403, 'Cet utilisateur n\'appartient pas à cette entreprise.');
        }
    }
}
