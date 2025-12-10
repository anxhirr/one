<?php

namespace App\Http\Controllers;

use App\Models\StoreManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreManagerController extends Controller
{
    /**
     * Display a listing of the store managers.
     */
    public function index(Request $request): JsonResponse
    {
        $query = StoreManager::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%")
                  ->orWhere('phone', 'LIKE', "%{$search}%");
            });
        }

        if ($request->has('storeId') && $request->storeId) {
            $query->where('store_id', $request->storeId);
        }

        $managers = $query->get()->map(function ($manager) {
            return [
                'id' => (string) $manager->id,
                'name' => $manager->name,
                'email' => $manager->email,
                'phone' => $manager->phone,
                'storeId' => (string) $manager->store_id,
                'status' => $manager->status,
            ];
        });

        return response()->json($managers);
    }

    /**
     * Store a newly created store manager in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|min:2',
            'email' => 'required|email',
            'phone' => 'required|string',
            'storeId' => 'required|exists:stores,id',
            'status' => 'required|in:active,inactive',
        ]);

        $manager = StoreManager::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'store_id' => $validated['storeId'],
            'status' => $validated['status'],
        ]);

        return response()->json([
            'id' => (string) $manager->id,
            'name' => $manager->name,
            'email' => $manager->email,
            'phone' => $manager->phone,
            'storeId' => (string) $manager->store_id,
            'status' => $manager->status,
        ], 201);
    }

    /**
     * Update the specified store manager in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $manager = StoreManager::find($id);

        if (!$manager) {
            return response()->json(['message' => 'Store manager not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|min:2',
            'email' => 'sometimes|required|email',
            'phone' => 'sometimes|required|string',
            'storeId' => 'sometimes|required|exists:stores,id',
            'status' => 'sometimes|required|in:active,inactive',
        ]);

        if (isset($validated['storeId'])) {
            $validated['store_id'] = $validated['storeId'];
            unset($validated['storeId']);
        }

        $manager->update($validated);

        return response()->json([
            'id' => (string) $manager->id,
            'name' => $manager->name,
            'email' => $manager->email,
            'phone' => $manager->phone,
            'storeId' => (string) $manager->store_id,
            'status' => $manager->status,
        ]);
    }

    /**
     * Remove the specified store manager from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $manager = StoreManager::find($id);

        if (!$manager) {
            return response()->json(['message' => 'Store manager not found'], 404);
        }

        $manager->delete();

        return response()->json(['message' => 'Store manager deleted successfully']);
    }
}

