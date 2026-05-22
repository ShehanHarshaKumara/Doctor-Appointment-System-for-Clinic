<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Medicine extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'medicine_no',
        'name',
        'generic_name',
        'category',
        'dosage_form',
        'stock_qty',
        'low_stock_threshold',
        'unit_price',
        'expiry_date',
        'supplier',
        'status',
    ];

    protected $casts = [
        'expiry_date' => 'date:Y-m-d',
        'unit_price' => 'decimal:2',
    ];
}
