<?php

namespace Database\Seeders;

use App\Models\Store;
use App\Models\StoreRepresentative;
use Illuminate\Database\Seeder;

class StoreRepresentativeSeeder extends Seeder
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

        $representatives = [
            [
                'name' => 'John Smith',
                'email' => 'john.smith@store.com',
                'phone' => '+1-555-1001',
                'store_id' => $stores[0]->id, // Downtown Store
                'status' => 'active',
            ],
            [
                'name' => 'Sarah Johnson',
                'email' => 'sarah.johnson@store.com',
                'phone' => '+1-555-1002',
                'store_id' => $stores[0]->id, // Downtown Store
                'status' => 'active',
            ],
            [
                'name' => 'Michael Brown',
                'email' => 'michael.brown@store.com',
                'phone' => '+1-555-1003',
                'store_id' => $stores[1]->id ?? $stores[0]->id, // Mall Location
                'status' => 'active',
            ],
            [
                'name' => 'Emily Davis',
                'email' => 'emily.davis@store.com',
                'phone' => '+1-555-1004',
                'store_id' => $stores[1]->id ?? $stores[0]->id, // Mall Location
                'status' => 'active',
            ],
            [
                'name' => 'David Wilson',
                'email' => 'david.wilson@store.com',
                'phone' => '+1-555-1005',
                'store_id' => $stores[2]->id ?? $stores[0]->id, // Airport Branch
                'status' => 'active',
            ],
            [
                'name' => 'Lisa Anderson',
                'email' => 'lisa.anderson@store.com',
                'phone' => '+1-555-1006',
                'store_id' => $stores[3]->id ?? $stores[0]->id, // Suburban Outlet
                'status' => 'inactive',
            ],
        ];

        foreach ($representatives as $representative) {
            StoreRepresentative::create($representative);
        }
    }
}

