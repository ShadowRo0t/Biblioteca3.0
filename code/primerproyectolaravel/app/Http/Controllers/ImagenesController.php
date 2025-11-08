<?php

namespace App\Http\Controllers;

use App\Models\Imagenes;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ImagenesController extends Controller
{
    /**
     * GET /api/v1/imagenes
     * Devuelve todas las imágenes en JSON.
     */
    public function index(): JsonResponse
    {
        // $data = Imagenes::query()->latest()->get(); // opción ordenada
        $data = Imagenes::all();
        return response()->json($data, 200);
    }

    /**
     * POST /api/v1/imagenes
     * Sube una imagen (multipart/form-data) y la registra en BD.
     * Campos: titulo (string), user_id (int existente), imagen (file)
     */
public function store(Request $request): JsonResponse
{
    // 1) Guard explícito: “ningún campo vacío”
    if (
        ! $request->has(['titulo', 'user_id']) ||
        blank($request->input('titulo')) ||
        blank($request->input('user_id')) ||
        ! $request->file('imagen')
    ) {
        return response()->json([
            'message' => 'No debe venir ningún campo vacío.',
            'errors'  => [
                'titulo'  => [blank($request->input('titulo')) ? 'El título es obligatorio.' : null],
                'user_id' => [blank($request->input('user_id')) ? 'El user_id es obligatorio.' : null],
                'imagen'  => [$request->file('imagen') ? null : 'La imagen es obligatoria.'],
            ],
        ], 422);
    }

    // 2) Validación formal
    $validated = $request->validate([
        'titulo'  => ['required','string','min:3','max:100'],
        'user_id' => ['required','integer','exists:users,id'],
        'imagen'  => ['required','image','mimes:jpg,jpeg,png,webp','max:5120'],
    ]);

    // 3) Guardado del archivo y registro
    $path = $request->file('imagen')->store('public/imagenes');
    $url  = \Illuminate\Support\Facades\Storage::url($path);

    $img = \App\Models\Imagenes::create([
        'titulo'    => $validated['titulo'],
        'ruta'      => $url,
        'miniatura' => null,
        'user_id'   => $validated['user_id'],
    ]);

    return response()->json($img, 201);
}


    // show/update/destroy los dejas para después
}
