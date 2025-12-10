<?php

namespace Database\Seeders;

use App\Models\Store;
use App\Models\StoreManager;
use Illuminate\Database\Seeder;

class StoreManagerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $stores = Store::all();
        
        if ($stores->isEmpty()) {
            $this->command->warn('No stores found. Please run StoreSeeder first.');
            return;
        }

        $managers = [
            [
                'name' => 'Robert Taylor',
                'email' => 'robert.taylor@store.com',
                'phone' => '+1-555-2001',
                'store_id' => $stores[0]->id, // Downtown Store
                'status' => 'active',
            ],
            [
                'name' => 'Jennifer Martinez',
                'email' => 'jennifer.martinez@store.com',
                'phone' => '+1-555-2002',
                'store_id' => $stores[1]->id ?? $stores[0]->id, // Mall Location
                'status' => 'active',
            ],
            [
                'name' => 'William Garcia',
                'email' => 'william.garcia@store.com',
                'phone' => '+1-555-2003',
                'store_id' => $stores[2]->id ?? $stores[0]->id, // Airport Branch
                'status' => 'active',
            ],
            [
                'name' => 'Amanda Rodriguez',
                'email' => 'amanda.rodriguez@store.com',
                'phone' => '+1-555-2004',
                'store_id' => $stores[3]->id ?? $stores[0]->id, // Suburban Outlet
                'status' => 'inactive',
            ],
        ];

        foreach ($managers as $manager) {
            StoreManager::create($manager);
        }
    }
}

