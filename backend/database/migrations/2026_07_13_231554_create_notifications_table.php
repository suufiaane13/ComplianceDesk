<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('entreprise_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('utilisateur_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('obligation_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', [
                'echeance_proche',
                'expiree',
                'document_ajoute',
                'document_supprime',
                'entreprise_creee',
                'entreprise_suspendue',
                'entreprise_activee',
                'admin_ajoute',
            ]);
            $table->text('message');
            $table->date('date_creation');
            $table->boolean('lue')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
