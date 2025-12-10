<?php

namespace App\Http\Controllers;

use App\Models\StoreManager;
use App\Models\StoreRepresentative;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle user login.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Determine user role
        $manager = StoreManager::where('user_id', $user->id)->first();
        $representative = StoreRepresentative::where('user_id', $user->id)->first();

        $role = null;
        $roleId = null;
        if ($manager) {
            $role = 'store_manager';
            $roleId = (string) $manager->id;
        } elseif ($representative) {
            $role = 'store_representative';
            $roleId = (string) $representative->id;
        }

        // Create token
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role,
                'roleId' => $roleId,
            ],
        ]);
    }

    /**
     * Handle user logout.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Get current authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        // Determine user role
        $manager = StoreManager::where('user_id', $user->id)->first();
        $representative = StoreRepresentative::where('user_id', $user->id)->first();

        $role = null;
        $roleId = null;
        if ($manager) {
            $role = 'store_manager';
            $roleId = (string) $manager->id;
        } elseif ($representative) {
            $role = 'store_representative';
            $roleId = (string) $representative->id;
        }

        return response()->json([
            'user' => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role,
                'roleId' => $roleId,
            ],
        ]);
    }
}
