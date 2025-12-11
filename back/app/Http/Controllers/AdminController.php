<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    /**
     * Verify admin passcode.
     */
    public function verifyPasscode(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'passcode' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Passcode is required.',
            ], 422);
        }

        $providedPasscode = $request->input('passcode');
        $correctPasscode = config('admin.passcode');

        if (empty($correctPasscode)) {
            return response()->json([
                'success' => false,
                'message' => 'Admin passcode is not configured.',
            ], 500);
        }

        if ($providedPasscode === $correctPasscode) {
            return response()->json([
                'success' => true,
                'message' => 'Passcode verified successfully.',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid passcode.',
        ], 401);
    }
}

