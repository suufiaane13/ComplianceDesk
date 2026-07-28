<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\UpdatePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects.'],
            ]);
        }

        if ($user->isTenantMember()) {
            $user->load('entreprise');

            if (!$user->entreprise) {
                throw ValidationException::withMessages([
                    'email' => ['Aucun compte entreprise associé.'],
                ]);
            }

            if ($user->entreprise->statut === 'suspendue') {
                throw ValidationException::withMessages([
                    'email' => ['Cette entreprise est suspendue. Contactez le support.'],
                ]);
            }
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie',
            'token' => $token,
            'user' => $user->load('entreprise'),
        ]);
    }

    public function user(Request $request)
    {
        return response()->json($request->user()->load('entreprise'));
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $user->update($request->validated());

        return response()->json($user->load('entreprise'));
    }

    public function updatePassword(UpdatePasswordRequest $request)
    {
        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        $user->update(['password' => $request->password]);

        $currentToken = $user->currentAccessToken();
        $user->tokens()
            ->when($currentToken, fn ($query) => $query->where('id', '!=', $currentToken->id))
            ->delete();

        return response()->json(['message' => 'Mot de passe modifié.']);
    }

    public function logout(Request $request)
    {
        $token = $request->user()->currentAccessToken();
        if ($token) {
            $token->delete();
        }

        return response()->json(['message' => 'Déconnecté']);
    }
}
