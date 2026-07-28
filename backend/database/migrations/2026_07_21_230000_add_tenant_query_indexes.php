<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('obligations', function (Blueprint $table) {
            $table->index(['entreprise_id', 'statut'], 'obligations_entreprise_statut_index');
            $table->index(['entreprise_id', 'date_echeance'], 'obligations_entreprise_echeance_index');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['utilisateur_id', 'lue'], 'notifications_utilisateur_lue_index');
        });
    }

    public function down(): void
    {
        Schema::table('obligations', function (Blueprint $table) {
            $table->dropIndex('obligations_entreprise_statut_index');
            $table->dropIndex('obligations_entreprise_echeance_index');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('notifications_utilisateur_lue_index');
        });
    }
};
