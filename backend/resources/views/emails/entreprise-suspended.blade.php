@extends('emails.layout')

@section('content')
    <p style="margin:0 0 12px;font-size:16px;font-weight:700;color:#0f172a;">
        Bonjour {{ $user->prenom }},
    </p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569;">
        L’accès de l’entreprise <strong>{{ $entreprise->raison_sociale }}</strong> à ComplianceDesk
        a été <strong style="color:#b91c1c;">suspendu</strong>.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;margin:0 0 20px;">
        <tr>
            <td style="padding:16px 18px;">
                <p style="margin:0;font-size:14px;line-height:1.55;color:#7f1d1d;">
                    La connexion à l’espace entreprise est temporairement indisponible.
                    Contactez le support ou votre administrateur plateforme pour plus d’informations.
                </p>
            </td>
        </tr>
    </table>

    <p style="margin:0;font-size:13px;line-height:1.5;color:#64748b;">
        Vous recevrez un nouvel email lorsque l’accès sera rétabli.
    </p>
@endsection
