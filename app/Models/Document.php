<?php

namespace App\Models;

use App\Models\Traits\HasFile;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property int $template_id
 * @property int $file_id
 * @property string $name
 * @property-read CarbonInterface $created_at
 * @property-read CarbonInterface $updated_at
 *
 * @property-read User $user
 * @property-read File $file
 * @property-read Template $template
 */
class Document extends Model
{
    use HasFile;

    protected $fillable = [
        'user_id',
        'file_id',
        'template_id',
        'name',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function file(): BelongsTo
    {
        return $this->belongsTo(File::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }
}
