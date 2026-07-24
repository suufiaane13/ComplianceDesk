<?php

namespace App\Services;

use App\Mail\AccountCreatedMail;
use App\Mail\EntrepriseSuspendedMail;
use App\Models\Entreprise;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Throwable;

class ComplianceMailer
{
    public static function frontendUrl(string $path = ''): string
    {
        $frontend = rtrim((string) env('FRONTEND_URL', env('APP_URL', 'http://localhost:3000')), '/');

        return $path === '' ? $frontend : $frontend.'/'.ltrim($path, '/');
    }

    public static function sendAccountCreated(User $user): void
    {
        try {
            $user->loadMissing('entreprise');

            $token = Password::broker()->createToken($user);
            $setPasswordUrl = self::frontendUrl('set-password').'?'.http_build_query([
                'email' => $user->email,
                'token' => $token,
            ]);

            Mail::to($user->email)->queue(new AccountCreatedMail($user, $setPasswordUrl));
        } catch (Throwable $e) {
            Log::warning('ComplianceMailer: échec envoi AccountCreatedMail', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public static function sendEntrepriseSuspended(Entreprise $entreprise): void
    {
        $admins = User::withoutGlobalScopes()
            ->where('entreprise_id', $entreprise->id)
            ->where('role', User::ROLE_ADMIN)
            ->get();

        foreach ($admins as $admin) {
            try {
                Mail::to($admin->email)->queue(new EntrepriseSuspendedMail($admin, $entreprise));
            } catch (Throwable $e) {
                Log::warning('ComplianceMailer: échec envoi EntrepriseSuspendedMail', [
                    'user_id' => $admin->id,
                    'entreprise_id' => $entreprise->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
