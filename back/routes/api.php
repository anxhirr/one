<?php

use App\Http\Controllers\StoreController;
use App\Http\Controllers\StoreRepresentativeController;
use App\Http\Controllers\StoreManagerController;
use Illuminate\Support\Facades\Route;

Route::apiResource('stores', StoreController::class);
Route::apiResource('store-representatives', StoreRepresentativeController::class);
Route::apiResource('store-managers', StoreManagerController::class);

