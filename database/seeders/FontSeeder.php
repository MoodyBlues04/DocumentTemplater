<?php

namespace Database\Seeders;

use App\Models\Font;
use Illuminate\Database\Seeder;

class FontSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Font::query()->insert([
            [
                'name' => 'DejaVu',
                'font_definition_file' => 'DejaVuSerif-Italic.ttf',
                'is_unicode' => true,
            ],
        ]);
    }
}
