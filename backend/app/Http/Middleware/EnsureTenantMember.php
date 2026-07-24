<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantMember
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->isTenantMember() || !$user->entreprise_id) {
            abort(403, 'Accès réservé aux membres d\'une entreprise');
        }

        return $next($request);
    }
}
