<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Libro extends Model
{
    use HasFactory;

    protected $fillable = [
        'titulo',
        'autor',
        'genero',
        'anio_edicion',
        'stock',
    ];

    // 🔹 Relación con reservas
    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }
}
