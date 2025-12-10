<?php

namespace App\Http\Controllers;

use App\Models\StoreRepresentative;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreRepresentativeController extends Controller
{
    /**
     * Display a listing of the store representatives.
     */
    public function index(Request $request): JsonResponse
    {
        $query = StoreRepresentative::query();

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

        $representatives = $query->get()->map(function ($representative) {
            return [
                'id' => (string) $representative->id,
                'name' => $representative->name,
                'email' => $representative->email,
                'phone' => $representative->phone,
                'storeId' => (string) $representative->store_id,
                'status' => $representative->status,
            ];
        });

        return response()->json($representatives);
    }

    /**
     * Store a newly created store representative in storage.
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

        $representative = StoreRepresentative::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'store_id' => $validated['storeId'],
            'status' => $validated['status'],
        ]);

        return response()->json([
            'id' => (string) $representative->id,
            'name' => $representative->name,
            'email' => $representative->email,
            'phone' => $representative->phone,
            'storeId' => (string) $representative->store_id,
            'status' => $representative->status,
        ], 201);
    }

    /**
     * Update the specified store representative in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $representative = StoreRepresentative::find($id);

        if (!$representative) {
            return response()->json(['message' => 'Store representative not found'], 404);
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

        $representative->update($validated);

        return response()->json([
            'id' => (string) $representative->id,
            'name' => $representative->name,
            'email' => $representative->email,
            'phone' => $representative->phone,
            'storeId' => (string) $representative->store_id,
            'status' => $representative->status,
        ]);
    }

    /**
     * Remove the specified store representative from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $representative = StoreRepresentative::find($id);

        if (!$representative) {
            return response()->json(['message' => 'Store representative not found'], 404);
        }

        $representative->delete();

        return response()->json(['message' => 'Store representative deleted successfully']);
    }
}

