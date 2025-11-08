<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Imagenes extends Model
{
    use HasFactory;

    protected $table = 'imagenes';

    protected $fillable = [
        'titulo',
        'ruta',
        'miniatura',
        'user_id',
    ];

    protected $casts = [
        'id'      => 'integer',
        'user_id' => 'integer',
    ];

    // Relación opcional (útil más adelante)
    // public function user() { return $this->belongsTo(User::class); }
}
