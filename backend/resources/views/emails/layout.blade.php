<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title ?? 'ComplianceDesk' }}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
                    <tr>
                        <td style="background:linear-gradient(90deg,#0f766e,#115e59);padding:20px 28px;">
                            <p style="margin:0;font-size:18px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">ComplianceDesk</p>
                            <p style="margin:4px 0 0;font-size:12px;color:#99f6e4;">Maroc · Conformité PME</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:28px;">
                            @yield('content')
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:16px 28px 24px;border-top:1px solid #f1f5f9;">
                            <p style="margin:0;font-size:11px;line-height:1.5;color:#94a3b8;">
                                Cet email a été envoyé automatiquement par ComplianceDesk.
                                Ne répondez pas à ce message.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
