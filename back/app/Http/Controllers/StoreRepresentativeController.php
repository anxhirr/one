<?php

namespace App\Http\Controllers;

use App\Models\StoreRepresentative;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

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
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string',
            'storeId' => 'required|exists:stores,id',
            'status' => 'required|in:active,inactive',
            'password' => 'required|string|min:8',
        ]);

        // Create or find user account
        // Note: Password is automatically hashed by User model's 'hashed' cast
        $user = User::firstOrCreate(
            ['email' => $validated['email']],
            [
                'name' => $validated['name'],
                'password' => $validated['password'],
            ]
        );

        // Update password if user already existed
        if ($user->wasRecentlyCreated === false) {
            $user->update([
                'name' => $validated['name'],
                'password' => $validated['password'],
            ]);
        }

        $representative = StoreRepresentative::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'store_id' => $validated['storeId'],
            'user_id' => $user->id,
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
            'email' => 'sometimes|required|email|unique:users,email,' . $representative->user_id,
            'phone' => 'sometimes|required|string',
            'storeId' => 'sometimes|required|exists:stores,id',
            'status' => 'sometimes|required|in:active,inactive',
            'password' => 'sometimes|string|min:8',
        ]);

        // Handle user account update/create
        if (isset($validated['email']) || isset($validated['password'])) {
            $user = null;

            if ($representative->user_id) {
                // Update existing user
                $user = User::find($representative->user_id);
            }

            if (!$user) {
                // Create new user if doesn't exist
                // Note: Password is automatically hashed by User model's 'hashed' cast
                $user = User::firstOrCreate(
                    ['email' => $validated['email'] ?? $representative->email],
                    [
                        'name' => $validated['name'] ?? $representative->name,
                        'password' => $validated['password'] ?? 'password',
                    ]
                );
                $validated['user_id'] = $user->id;
            } else {
                // Update existing user
                // Note: Password is automatically hashed by User model's 'hashed' cast
                $userData = [];
                if (isset($validated['name'])) {
                    $userData['name'] = $validated['name'];
                }
                if (isset($validated['email'])) {
                    $userData['email'] = $validated['email'];
                }
                if (isset($validated['password'])) {
                    $userData['password'] = $validated['password'];
                }
                if (!empty($userData)) {
                    $user->update($userData);
                }
            }
        }

        if (isset($validated['storeId'])) {
            $validated['store_id'] = $validated['storeId'];
            unset($validated['storeId']);
        }

        // Remove password from representative update data
        unset($validated['password']);

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

    /**
     * Get store details for the authenticated store representative.
     */
    public function myStore(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $representative = StoreRepresentative::where('user_id', $user->id)->first();

        if (!$representative) {
            return response()->json(['message' => 'Store representative record not found'], 404);
        }

        $store = $representative->store;

        if (!$store) {
            return response()->json(['message' => 'Store not found'], 404);
        }

        // Load store with relationships for metrics
        $store->load(['managers', 'representatives']);

        // Calculate metrics
        $totalManagers = $store->managers->count();
        $totalRepresentatives = $store->representatives->count();
        $storeAge = $store->created_at->diffInDays(now());

        return response()->json([
            'store' => [
                'id' => (string) $store->id,
                'name' => $store->name,
                'address' => $store->address,
                'phone' => $store->phone,
                'email' => $store->email,
                'status' => $store->status,
                'createdAt' => $store->created_at->toISOString(),
            ],
            'metrics' => [
                'totalManagers' => $totalManagers,
                'totalRepresentatives' => $totalRepresentatives,
                'storeAgeDays' => $storeAge,
            ],
        ]);
    }
}

