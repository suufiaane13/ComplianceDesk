<?php

namespace App\Mail;

use App\Models\Entreprise;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EntrepriseSuspendedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public Entreprise $entreprise,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "[ComplianceDesk] Accès suspendu — {$this->entreprise->raison_sociale}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.entreprise-suspended',
        );
    }
}
