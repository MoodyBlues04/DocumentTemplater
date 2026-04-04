<?php

namespace Database\Factories;

use App\Models\Enum\Orientation;
use App\Models\File;
use App\Models\Template;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Template>
 */
class TemplateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::query()->inRandomOrder()->firstOrFail()->id,
            'file_id' => File::query()->inRandomOrder()->firstOrFail()->id,
            'orientation' => $this->faker->randomElement(Orientation::cases()),
            'name' => Str::random(10),
        ];
    }
}
