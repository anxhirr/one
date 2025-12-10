<?php

namespace App\Http\Controllers;

use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class StoreController extends Controller
{
    /**
     * Display a listing of the stores.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Store::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('address', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status) {
            $status = $request->status;
            if (in_array($status, ['active', 'inactive'])) {
                $query->where('status', $status);
            }
        }

        $stores = $query->get()->map(function ($store) {
            return [
                'id' => (string) $store->id,
                'name' => $store->name,
                'address' => $store->address,
                'phone' => $store->phone,
                'email' => $store->email,
                'status' => $store->status,
            ];
        });

        return response()->json($stores);
    }

    /**
     * Store a newly created store in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|min:2',
            'address' => 'required|string',
            'phone' => 'required|string',
            'email' => 'required|email',
            'status' => 'required|in:active,inactive',
        ]);

        $store = Store::create($validated);

        return response()->json([
            'id' => (string) $store->id,
            'name' => $store->name,
            'address' => $store->address,
            'phone' => $store->phone,
            'email' => $store->email,
            'status' => $store->status,
        ], 201);
    }

    /**
     * Update the specified store in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $store = Store::find($id);

        if (!$store) {
            return response()->json(['message' => 'Store not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|min:2',
            'address' => 'sometimes|required|string',
            'phone' => 'sometimes|required|string',
            'email' => 'sometimes|required|email',
            'status' => 'sometimes|required|in:active,inactive',
        ]);

        $store->update($validated);

        return response()->json([
            'id' => (string) $store->id,
            'name' => $store->name,
            'address' => $store->address,
            'phone' => $store->phone,
            'email' => $store->email,
            'status' => $store->status,
        ]);
    }

    /**
     * Remove the specified store from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $store = Store::find($id);

        if (!$store) {
            return response()->json(['message' => 'Store not found'], 404);
        }

        $store->delete();

        return response()->json(['message' => 'Store deleted successfully']);
    }
}

