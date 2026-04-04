<?php

namespace App\Services;

use App\Models\Font;
use Illuminate\Database\Eloquent\Collection;

readonly class FontService
{
    /**
     * @return Collection<int, Font>
     */
    public function getAll(): Collection
    {
        return Font::query()->get();
    }
}
