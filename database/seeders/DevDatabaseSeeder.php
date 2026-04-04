<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DevDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            FontSeeder::class,
            FileSeeder::class,
            TemplateSeeder::class,
        ]);
    }
}
