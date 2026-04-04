<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property string $path
 * @property-read CarbonInterface $created_at
 * @property-read CarbonInterface $updated_at
 */
class File extends Model
{
    use HasFactory;

    protected $fillable = [
        'path',
    ];

    // todo clear storage on delete

    public function getFullPath(): string
    {
        return Storage::disk('public')->path($this->path);
    }

    public function getExtension(): string
    {
        return \Illuminate\Support\Facades\File::extension($this->path);
    }
}
