<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\StoreRepresentativeController;
use App\Http\Controllers\StoreManagerController;
use App\Http\Controllers\StoreTargetController;
use Illuminate\Support\Facades\Route;

// Public authentication routes
Route::post('login', [AuthController::class, 'login'])->name('login');

// Admin passcode verification route
Route::post('admin/verify-passcode', [AdminController::class, 'verifyPasscode'])->name('admin.verify-passcode');

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
Route::prefix('stores/{store}')->group(function () {
    Route::get('targets', [StoreTargetController::class, 'index'])->name('stores.targets.index');
    Route::post('targets', [StoreTargetController::class, 'store'])->name('stores.targets.store');
    Route::get('targets/{target}', [StoreTargetController::class, 'show'])->name('stores.targets.show');
    Route::put('targets/{target}', [StoreTargetController::class, 'update'])->name('stores.targets.update');
    Route::delete('targets/{target}', [StoreTargetController::class, 'destroy'])->name('stores.targets.destroy');
});
Route::apiResource('store-representatives', StoreRepresentativeController::class);
Route::apiResource('store-managers', StoreManagerController::class);

