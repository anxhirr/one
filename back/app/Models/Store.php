<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Store extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'address',
        'phone',
        'email',
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
            'status' => 'string',
        ];
    }

    /**
     * Get the representatives for the store.
     */
    public function representatives(): HasMany
    {
        return $this->hasMany(StoreRepresentative::class);
    }

    /**
     * Get the managers for the store.
     */
    public function managers(): HasMany
    {
        return $this->hasMany(StoreManager::class);
    }

    /**
     * Get the targets for the store.
     */
    public function targets(): HasMany
    {
        return $this->hasMany(StoreTarget::class);
    }

    /**
     * Get the active targets for the store.
     */
    public function activeTargets(): HasMany
    {
        return $this->hasMany(StoreTarget::class)->where('status', 'active');
    }
}

