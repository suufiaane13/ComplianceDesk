<?php

namespace App\Services;

use Carbon\Carbon;
use DateTimeInterface;

class ObligationStatusCalculator
{
    public const A_JOUR = 'a_jour';

    public const PROCHE_ECHEANCE = 'proche_echeance';

    public const EXPIREE = 'expiree';

    public static function fromDate(DateTimeInterface|string $dateEcheance, DateTimeInterface|string|null $now = null): string
    {
        $due = Carbon::parse($dateEcheance)->startOfDay();
        $reference = $now ? Carbon::parse($now)->startOfDay() : now()->startOfDay();

        if ($due->lt($reference)) {
            return self::EXPIREE;
        }

        if ($reference->diffInDays($due) <= 30) {
            return self::PROCHE_ECHEANCE;
        }

        return self::A_JOUR;
    }
}
