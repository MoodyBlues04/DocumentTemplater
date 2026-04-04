<?php

namespace App\Models;

use App\Models\Enum\Orientation;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $user_id
 * @property int $file_id
 * @property string $name
 * @property Orientation $orientation
 * @property-read CarbonInterface $created_at
 * @property-read CarbonInterface $updated_at
 *
 * @property-read User $user
 * @property-read File $file
 * @property-read Collection<int, TemplateField> $fields
 */
class Template extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'file_id',
        'name',
        'orientation',
    ];

    protected $casts = [
        'orientation' => Orientation::class,
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function file(): BelongsTo
    {
        return $this->belongsTo(File::class);
    }

    public function fields(): HasMany
    {
        return $this->hasMany(TemplateField::class);
    }
}
