<?php

use Illuminate\Support\Facades\Route;

Route::get('/stores', function () {
    return response()->json([
        [
            'id' => '1',
            'name' => 'Downtown Store',
            'address' => '123 Main Street, City Center',
            'phone' => '+1-555-0101',
            'email' => 'downtown@store.com',
            'status' => 'active',
        ],
        [
            'id' => '2',
            'name' => 'Mall Location',
            'address' => '456 Shopping Mall, North District',
            'phone' => '+1-555-0102',
            'email' => 'mall@store.com',
            'status' => 'active',
        ],
        [
            'id' => '3',
            'name' => 'Airport Branch',
            'address' => '789 Airport Road, Terminal 2',
            'phone' => '+1-555-0103',
            'email' => 'airport@store.com',
            'status' => 'active',
        ],
        [
            'id' => '4',
            'name' => 'Suburban Outlet',
            'address' => '321 Suburban Avenue, West Side',
            'phone' => '+1-555-0104',
            'email' => 'suburban@store.com',
            'status' => 'inactive',
        ],
        [
            'id' => '5',
            'name' => 'City Plaza',
            'address' => '567 Plaza Drive, Downtown',
            'phone' => '+1-555-0105',
            'email' => 'plaza@store.com',
            'status' => 'active',
        ],
    ]);
});

