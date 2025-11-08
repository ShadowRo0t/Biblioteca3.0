<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reserva extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'libro_id',
        'tipo',
        'desde',
        'hasta',
    ];

    // 🔹 Relación con Usuario
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // 🔹 Relación con Libro
    public function libro()
    {
        return $this->belongsTo(Libro::class);
    }
}
