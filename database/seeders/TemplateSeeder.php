<?php

namespace Database\Seeders;

use App\Models\Template;
use App\Models\TemplateField;
use App\Models\User;
use Illuminate\Database\Seeder;

class TemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::query()->where('email', UserSeeder::TEST_USER_EMAIL)->firstOrFail();

        Template::factory(2)
            ->has(TemplateField::factory()->count(3), 'fields')
            ->create([
                'user_id' => $user->id
            ]);
    }
}
