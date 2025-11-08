<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;
use App\Models\User;

class ImagenesTableSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        // Toma un user_id válido (y si no hubiera ninguno, crea uno)
        $userId = User::query()->inRandomOrder()->value('id')
               ?? User::factory()->create([
                    'name'  => 'Seeder User',
                    'email' => 'seeder@homestead.test',
                  ])->id;

        for ($i = 0; $i < 20; $i++) {
            DB::table('imagenes')->insert([
                'titulo'     => $faker->sentence(3),
                'ruta'       => '/storage/imagenes/'.$faker->uuid.'.jpg',
                'miniatura'  => '/storage/imagenes/thumbs/'.$faker->uuid.'.jpg',
                'user_id'    => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
