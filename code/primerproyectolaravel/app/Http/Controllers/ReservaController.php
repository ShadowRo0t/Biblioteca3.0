<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reserva;

class ReservaController extends Controller
{
    // 📌 Mostrar todas las reservas del usuario logueado
    public function index(Request $request)
    {
        try {
            $reservas = Reserva::with('libro')
                ->where('user_id', $request->user()->id)
                ->get();

            return response()->json($reservas, 200);
        } catch (\Exception $e) {
            \Log::error('❌ Error al obtener reservas: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al obtener reservas',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    // 📌 Crear una nueva reserva
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'libro_id' => 'required|exists:libros,id',
                'tipo'     => 'required|string',
                'desde'    => 'required|date',
                'hasta'    => 'required|date|after_or_equal:desde',
            ]);

            $reserva = Reserva::create([
                'user_id'  => $request->user()->id,
                'libro_id' => $request->input('libro_id'),
                'tipo'     => $request->input('tipo'),
                'desde'    => $request->input('desde'),
                'hasta'    => $request->input('hasta'),
            ]);

            return response()->json($reserva, 201);

        } catch (\Exception $e) {
            \Log::error('❌ Error al crear reserva: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al crear la reserva',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    // 📌 Eliminar una reserva
    public function destroy($id, Request $request)
    {
        try {
            $reserva = Reserva::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            $reserva->delete();

            return response()->json(['message' => '✅ Reserva eliminada'], 200);

        } catch (\Exception $e) {
            \Log::error('❌ Error al eliminar reserva: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al eliminar la reserva',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
