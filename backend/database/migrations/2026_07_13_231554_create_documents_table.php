<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('obligation_id')->constrained()->cascadeOnDelete();
            $table->string('nom_fichier');
            $table->string('type_document')->nullable();
            $table->date('date_ajout');
            $table->string('chemin_fichier');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
