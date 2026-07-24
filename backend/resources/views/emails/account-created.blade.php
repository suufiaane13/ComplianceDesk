@extends('emails.layout')

@section('content')
    <p style="margin:0 0 12px;font-size:16px;font-weight:700;color:#0f172a;">
        Bonjour {{ $user->prenom }},
    </p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569;">
        Un compte <strong>ComplianceDesk</strong> a été créé pour vous
        @if($user->entreprise)
            au sein de <strong>{{ $user->entreprise->raison_sociale }}</strong>
        @endif.
    </p>

    <p style="margin:0 0 20px;font-size:13px;line-height:1.5;color:#64748b;">
        Pour activer votre accès, choisissez un mot de passe via le lien ci-dessous (valable pour une durée limitée).
    </p>

    <p style="margin:0 0 8px;">
        <a href="{{ $setPasswordUrl }}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 20px;border-radius:10px;">
            Définir mon mot de passe
        </a>
    </p>

    <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#94a3b8;">
        Si le bouton ne fonctionne pas, copiez ce lien :<br>
        <span style="word-break:break-all;color:#64748b;">{{ $setPasswordUrl }}</span>
    </p>
@endsection
