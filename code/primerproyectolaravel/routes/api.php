<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ImagenesController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReservaController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::prefix('v1')->group(function () {
    Route::resource('imagenes', ImagenesController::class)->only(['index', 'store']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/reservas', [ReservaController::class, 'index']);
    Route::post('/reservas', [ReservaController::class, 'store']);
    Route::delete('/reservas/{id}', [ReservaController::class, 'destroy']);
});


