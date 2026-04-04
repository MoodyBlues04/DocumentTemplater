<?php

namespace Database\Factories;

use App\Models\Template;
use App\Models\TemplateField;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<TemplateField>
 */
class TemplateFieldFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'template_id' => Template::query()->inRandomOrder()->firstOrFail()->id,
            'name' => Str::random(10),
            'font_size' => $this->faker->numberBetween(1, 10),
            'font_name' => Str::random(4),
            'font_color' => $this->faker->randomElement(['red', 'blue', 'black']),
            'height' => $this->faker->numberBetween(1, 10),
            'width' => $this->faker->numberBetween(10, 30),
            'x_coordinate' => $this->faker->numberBetween(10, 30),
            'y_coordinate' => $this->faker->numberBetween(10, 30),
        ];
    }
}
