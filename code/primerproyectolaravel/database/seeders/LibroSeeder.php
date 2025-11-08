<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LibroSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('libros')->insert([
            [
                'titulo' => 'Cien años de soledad',
                'autor' => 'Gabriel García Márquez',
                'genero' => 'Novela realista mágico',
                'anio_edicion' => '1967',
                'stock' => 5,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'titulo' => 'Don Quijote de la Mancha',
                'autor' => 'Miguel de Cervantes',
                'genero' => 'Narrativo',
                'anio_edicion' => '1605',
                'stock' => 3,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'titulo' => 'El Principito',
                'autor' => 'Antoine de Saint-Exupéry',
                'genero' => 'Novela infantil',
                'anio_edicion' => '1943',
                'stock' => 10,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'titulo' => 'Crepúsculo',
                'autor' => 'Stephenie Meyer',
                'genero' => 'Novela fantasía',
                'anio_edicion' => '2005',
                'stock' => 4,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'titulo' => 'La Odisea',
                'autor' => 'Homero',
                'genero' => 'Poema épico',
                'anio_edicion' => '800 AC',
                'stock' => 7,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
    }
}
