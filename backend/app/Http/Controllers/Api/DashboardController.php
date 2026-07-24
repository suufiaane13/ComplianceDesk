<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Entreprise;
use App\Models\Obligation;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $entrepriseId = $request->user()->entreprise_id;

        $obligations = Obligation::where('entreprise_id', $entrepriseId);

        $total = (clone $obligations)->count();

        $aJour = (clone $obligations)->where('statut', 'a_jour')->count();
        $procheEcheance = (clone $obligations)->where('statut', 'proche_echeance')->count();
        $expirees = (clone $obligations)->where('statut', 'expiree')->count();

        $categories = (clone $obligations)
            ->selectRaw('categorie, count(*) as total')
            ->groupBy('categorie')
            ->whereNotNull('categorie')
            ->get();

        $notificationsNonLues = Notification::where('utilisateur_id', $request->user()->id)
            ->where('lue', false)
            ->count();

        $prochainesEcheances = (clone $obligations)
            ->where('statut', '!=', 'expiree')
            ->where('date_echeance', '>=', now())
            ->orderBy('date_echeance', 'asc')
            ->limit(5)
            ->get();

        return response()->json([
            'total_obligations' => $total,
            'a_jour' => $aJour,
            'proches_echeance' => $procheEcheance,
            'expirees' => $expirees,
            'categorie_distribution' => $categories,
            'notifications_non_lues' => $notificationsNonLues,
            'prochaines_echeances' => $prochainesEcheances,
        ]);
    }

    public function platform(Request $request)
    {
        if (!$request->user()->isSuperAdmin()) {
            abort(403, 'Action réservée au super administrateur');
        }

        return response()->json([
            'entreprises_total' => Entreprise::count(),
            'entreprises_actives' => Entreprise::where('statut', 'active')->count(),
            'entreprises_suspendues' => Entreprise::where('statut', 'suspendue')->count(),
            'users_total' => User::whereIn('role', [User::ROLE_ADMIN, User::ROLE_USER])->count(),
            'obligations_total' => Obligation::count(),
            'recent_entreprises' => Entreprise::withCount('users', 'obligations')
                ->orderByDesc('created_at')
                ->limit(5)
                ->get(),
        ]);
    }
}
