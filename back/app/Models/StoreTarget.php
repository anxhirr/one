<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class StoreTarget extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'store_id',
        'metric_type',
        'period_type',
        'target_value',
        'period_start',
        'period_end',
        'status',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'target_value' => 'decimal:2',
            'period_start' => 'date',
            'period_end' => 'date',
            'status' => 'string',
            'metric_type' => 'string',
            'period_type' => 'string',
        ];
    }

    /**
     * Get the store that owns the target.
     */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    /**
     * Scope a query to only include targets for a specific period type.
     */
    public function scopeForPeriodType(Builder $query, string $periodType): Builder
    {
        return $query->where('period_type', $periodType);
    }

    /**
     * Scope a query to only include targets for a specific metric type.
     */
    public function scopeForMetricType(Builder $query, string $metricType): Builder
    {
        return $query->where('metric_type', $metricType);
    }

    /**
     * Scope a query to only include targets with a specific status.
     */
    public function scopeWithStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include active targets.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }
}
