<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountCreatedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $setPasswordUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[ComplianceDesk] Votre compte a été créé',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.account-created',
        );
    }
}
