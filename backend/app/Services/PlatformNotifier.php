<?php

namespace App\Services;

use App\Models\Entreprise;
use App\Models\Notification;
use App\Models\User;

class PlatformNotifier
{
    public static function notifySuperAdmins(string $type, string $message, ?Entreprise $entreprise = null): void
    {
        $superAdmins = User::where('role', User::ROLE_SUPER_ADMIN)->get();

        foreach ($superAdmins as $admin) {
            Notification::create([
                'entreprise_id' => $entreprise?->id,
                'utilisateur_id' => $admin->id,
                'obligation_id' => null,
                'type' => $type,
                'message' => $message,
                'date_creation' => now()->format('Y-m-d'),
                'lue' => false,
            ]);
        }
    }
}
