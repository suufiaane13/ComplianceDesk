<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

        DB::statement('ALTER TABLE notifications MODIFY entreprise_id BIGINT UNSIGNED NULL');
        DB::statement("ALTER TABLE notifications MODIFY type ENUM(
            'echeance_proche',
            'expiree',
            'document_ajoute',
            'document_supprime',
            'entreprise_creee',
            'entreprise_suspendue',
            'entreprise_activee',
            'admin_ajoute'
        ) NOT NULL");
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

        DB::table('notifications')
            ->whereIn('type', ['entreprise_creee', 'entreprise_suspendue', 'entreprise_activee', 'admin_ajoute'])
            ->delete();

        DB::statement("ALTER TABLE notifications MODIFY type ENUM(
            'echeance_proche',
            'expiree',
            'document_ajoute',
            'document_supprime'
        ) NOT NULL");
        DB::statement('ALTER TABLE notifications MODIFY entreprise_id BIGINT UNSIGNED NOT NULL');
    }
};
