<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use Illuminate\Http\Request;

class MedicineController extends Controller
{
    public function index(Request $request)
    {
        $query = Medicine::query()->orderBy('name');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('medicine_no', 'like', "%{$search}%")
                    ->orWhere('generic_name', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%")
                    ->orWhere('supplier', 'like', "%{$search}%");
            });
        }

        return response()->json(['medicines' => $query->limit(100)->get()]);
    }

    public function show(Medicine $medicine)
    {
        return response()->json(['medicine' => $medicine]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        $medicine = Medicine::create($data + [
            'medicine_no' => sprintf('MED-%s-%04d', now()->format('Y'), Medicine::withTrashed()->count() + 1),
            'status' => $this->statusFor($data),
        ]);

        return response()->json(['medicine' => $medicine], 201);
    }

    public function update(Request $request, Medicine $medicine)
    {
        $data = $this->validated($request, true);
        $medicine->update($data + ['status' => $this->statusFor($data + $medicine->toArray())]);

        return response()->json(['medicine' => $medicine]);
    }

    public function destroy(Medicine $medicine)
    {
        $medicine->delete();

        return response()->noContent();
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $rule = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'name' => [$rule, 'string', 'max:255'],
            'generic_name' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'dosage_form' => ['nullable', 'string', 'max:100'],
            'stock_qty' => ['nullable', 'integer', 'min:0'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0'],
            'unit_price' => ['nullable', 'numeric', 'min:0'],
            'expiry_date' => ['nullable', 'date'],
            'supplier' => ['nullable', 'string', 'max:255'],
        ]);
    }

    private function statusFor(array $data): string
    {
        if (! empty($data['expiry_date']) && $data['expiry_date'] < now()->toDateString()) {
            return 'expired';
        }

        if (($data['stock_qty'] ?? 0) <= ($data['low_stock_threshold'] ?? 10)) {
            return 'low_stock';
        }

        return 'active';
    }
}
