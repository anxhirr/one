<?php

namespace App\Http\Controllers;

use App\Models\Store;
use App\Models\StoreTarget;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreTargetController extends Controller
{
    /**
     * Display a listing of targets for a store.
     */
    public function index(Request $request, string $storeId): JsonResponse
    {
        $store = Store::find($storeId);

        if (!$store) {
            return response()->json(['message' => 'Store not found'], 404);
        }

        $query = $store->targets()->orderBy('period_start', 'desc');

        if ($request->has('period_type') && $request->period_type) {
            $query->where('period_type', $request->period_type);
        }

        if ($request->has('metric_type') && $request->metric_type) {
            $query->where('metric_type', $request->metric_type);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $targets = $query->get()->map(function ($target) {
            return [
                'id' => (string) $target->id,
                'store_id' => (string) $target->store_id,
                'metric_type' => $target->metric_type,
                'period_type' => $target->period_type,
                'target_value' => (string) $target->target_value,
                'period_start' => $target->period_start->format('Y-m-d'),
                'period_end' => $target->period_end ? $target->period_end->format('Y-m-d') : null,
                'status' => $target->status,
                'created_at' => $target->created_at->toISOString(),
                'updated_at' => $target->updated_at->toISOString(),
            ];
        });

        return response()->json($targets);
    }

    /**
     * Store a newly created target in storage.
     */
    public function store(Request $request, string $storeId): JsonResponse
    {
        $store = Store::find($storeId);

        if (!$store) {
            return response()->json(['message' => 'Store not found'], 404);
        }

        $validated = $request->validate([
            'metric_type' => 'required|in:customer_visits,orders,revenue',
            'period_type' => 'required|in:daily,weekly,monthly,yearly',
            'target_value' => 'required|numeric|min:0',
            'period_start' => 'required|date',
            'period_end' => 'nullable|date|after:period_start',
            'status' => 'required|in:active,completed,cancelled',
        ]);

        $validated['store_id'] = $store->id;

        $target = StoreTarget::create($validated);

        return response()->json([
            'id' => (string) $target->id,
            'store_id' => (string) $target->store_id,
            'metric_type' => $target->metric_type,
            'period_type' => $target->period_type,
            'target_value' => (string) $target->target_value,
            'period_start' => $target->period_start->format('Y-m-d'),
            'period_end' => $target->period_end ? $target->period_end->format('Y-m-d') : null,
            'status' => $target->status,
            'created_at' => $target->created_at->toISOString(),
            'updated_at' => $target->updated_at->toISOString(),
        ], 201);
    }

    /**
     * Display the specified target.
     */
    public function show(string $storeId, string $id): JsonResponse
    {
        $target = StoreTarget::where('store_id', $storeId)->find($id);

        if (!$target) {
            return response()->json(['message' => 'Target not found'], 404);
        }

        return response()->json([
            'id' => (string) $target->id,
            'store_id' => (string) $target->store_id,
            'metric_type' => $target->metric_type,
            'period_type' => $target->period_type,
            'target_value' => (string) $target->target_value,
            'period_start' => $target->period_start->format('Y-m-d'),
            'period_end' => $target->period_end ? $target->period_end->format('Y-m-d') : null,
            'status' => $target->status,
            'created_at' => $target->created_at->toISOString(),
            'updated_at' => $target->updated_at->toISOString(),
        ]);
    }

    /**
     * Update the specified target in storage.
     */
    public function update(Request $request, string $storeId, string $id): JsonResponse
    {
        $target = StoreTarget::where('store_id', $storeId)->find($id);

        if (!$target) {
            return response()->json(['message' => 'Target not found'], 404);
        }

        $validated = $request->validate([
            'metric_type' => 'sometimes|required|in:customer_visits,orders,revenue',
            'period_type' => 'sometimes|required|in:daily,weekly,monthly,yearly',
            'target_value' => 'sometimes|required|numeric|min:0',
            'period_start' => 'sometimes|required|date',
            'period_end' => 'nullable|date|after:period_start',
            'status' => 'sometimes|required|in:active,completed,cancelled',
        ]);

        $target->update($validated);

        return response()->json([
            'id' => (string) $target->id,
            'store_id' => (string) $target->store_id,
            'metric_type' => $target->metric_type,
            'period_type' => $target->period_type,
            'target_value' => (string) $target->target_value,
            'period_start' => $target->period_start->format('Y-m-d'),
            'period_end' => $target->period_end ? $target->period_end->format('Y-m-d') : null,
            'status' => $target->status,
            'created_at' => $target->created_at->toISOString(),
            'updated_at' => $target->updated_at->toISOString(),
        ]);
    }

    /**
     * Remove the specified target from storage.
     */
    public function destroy(string $storeId, string $id): JsonResponse
    {
        $target = StoreTarget::where('store_id', $storeId)->find($id);

        if (!$target) {
            return response()->json(['message' => 'Target not found'], 404);
        }

        $target->delete();

        return response()->json(['message' => 'Target deleted successfully']);
    }
}
