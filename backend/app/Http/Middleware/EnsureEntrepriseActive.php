<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEntrepriseActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->isTenantMember()) {
            $user->loadMissing('entreprise');

            if (!$user->entreprise || $user->entreprise->statut === 'suspendue') {
                $token = $user->currentAccessToken();
                if ($token) {
                    $token->delete();
                }

                abort(403, 'Cette entreprise est suspendue. Contactez le support.');
            }
        }

        return $next($request);
    }
}
