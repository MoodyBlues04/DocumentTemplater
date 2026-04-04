<?php

namespace App\Models;

use App\Models\Enum\FontColor;
use App\Models\ValueObject\Coordinates;
use App\Models\ValueObject\Size;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $template_id
 * @property int $font_id
 * @property string $name
 * @property int $font_size
 * @property FontColor $font_color
 * @property Size $size
 * @property Coordinates $coordinates
 * @property-read CarbonInterface $created_at
 * @property-read CarbonInterface $updated_at
 *
 * @property-read Template $template
 * @property-read Font $font
 */
class TemplateField extends Model
{
    use HasFactory;
    protected $fillable = [
        'template_id',
        'font_id',
        'font_size',
        'font_color',
        'height',
        'width',
        'x_coordinate',
        'y_coordinate',
    ];

    protected $casts = [
        'font_color' => FontColor::class,
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }

    public function font(): BelongsTo
    {
        return $this->belongsTo(Font::class);
    }

    protected function size(): Attribute
    {
        return Attribute::make(
            get: fn (mixed $value, array $attributes) => new Size(
                $attributes['height'],
                $attributes['width'],
            ),
        );
    }

    protected function coordinates(): Attribute
    {
        return Attribute::make(
            get: fn (mixed $value, array $attributes) => new Coordinates(
                $attributes['x_coordinate'],
                $attributes['y_coordinate'],
            ),
        );
    }
}
