<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
}
