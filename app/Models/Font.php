<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $name
 * @property string $font_definition_file
 * @property boolean $is_unicode
 * @property-read CarbonInterface $created_at
 * @property-read CarbonInterface $updated_at
 */
class Font extends Model
{
    protected $fillable = [
        'name',
        'font_definition_file',
        'is_unicode',
    ];
}
