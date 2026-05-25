<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;

class UserController extends Controller
{
    public function index()
    {
        return response()->json([
            'users' => User::query()
                ->select(['id', 'name', 'email', 'phone', 'role', 'is_active', 'created_at'])
                ->latest()
                ->limit(100)
                ->get(),
        ]);
    }
}
