<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Numéro marocain mobile/fixe : 0[5-7]XXXXXXXX ou +212[5-7]XXXXXXXX (espaces / tirets tolérés).
 */
class MoroccanPhone implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if ($value === null || $value === '') {
            return;
        }

        if (! is_string($value)) {
            $fail('Le :attribute doit être un numéro de téléphone valide.');

            return;
        }

        $digits = preg_replace('/\D+/', '', $value) ?? '';

        if (str_starts_with($digits, '212')) {
            $digits = '0'.substr($digits, 3);
        }

        if (! preg_match('/^0[5-7]\d{8}$/', $digits)) {
            $fail('Le :attribute doit être un numéro marocain valide (ex. 0522 00 00 00 ou +212 522 00 00 00).');
        }
    }
}
