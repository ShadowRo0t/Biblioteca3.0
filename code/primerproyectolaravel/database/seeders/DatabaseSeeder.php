<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Asegura que exista al menos un usuario
        if (!User::exists()) {
            User::factory()->create([
                'name'  => 'Admin',
                'email' => 'admin@homestead.test',
                // password por defecto de la factory; si quieres fijo:
                // 'password' => bcrypt('password'),
            ]);
        }

        // Luego siembra las imágenes
        $this->call(ImagenesTableSeeder::class);
    }
}
