<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\StoreRepresentativeController;
use App\Http\Controllers\StoreManagerController;
use Illuminate\Support\Facades\Route;

// Public authentication routes
Route::post('login', [AuthController::class, 'login'])->name('login');

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Authentication routes
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('me', [AuthController::class, 'me'])->name('me');

    // Dashboard routes for authenticated SR/SM - MUST be before apiResource routes
    Route::get('store-managers/my-store', [StoreManagerController::class, 'myStore'])->name('store-managers.my-store');
    Route::get('store-representatives/my-store', [StoreRepresentativeController::class, 'myStore'])->name('store-representatives.my-store');
});

Route::apiResource('stores', StoreController::class);
Route::apiResource('store-representatives', StoreRepresentativeController::class);
Route::apiResource('store-managers', StoreManagerController::class);

