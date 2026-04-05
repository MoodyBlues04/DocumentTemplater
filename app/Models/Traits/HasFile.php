<?php

namespace App\Models\Traits;

use App\Models\File;
use Illuminate\Support\Facades\Storage;

/**
 * @property File $file
 */
trait HasFile
{
    protected static function booted(): void
    {
        static::deleting(function ($model) {
            if ($model->file) {
                Storage::disk('public')->delete($model->file->path);
                $model->file->delete();
            }
        });
        parent::booted();
    }
}
