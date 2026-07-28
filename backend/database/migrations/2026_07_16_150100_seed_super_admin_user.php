<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('users')) {
            return;
        }

        $exists = DB::table('users')->where('email', 'superadmin@compliancedesk.ma')->exists();
        if ($exists) {
            return;
        }

        DB::table('users')->insert([
            'entreprise_id' => null,
            'nom' => 'Super',
            'prenom' => 'Admin',
            'email' => 'superadmin@compliancedesk.ma',
            'password' => Hash::make('password'),
            'role' => 'super_admin',
            'date_creation' => now()->toDateString(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('users')->where('email', 'superadmin@compliancedesk.ma')->delete();
    }
};
