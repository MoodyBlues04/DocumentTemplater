<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const TABLE_NAME = 'template_fields';
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create(self::TABLE_NAME, function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained();
            $table->unsignedInteger('font_size');
            $table->string('name');
            $table->string('font_name');
            $table->string('font_color');
            $table->unsignedInteger('height');
            $table->unsignedInteger('width');
            $table->bigInteger('x_coordinate');
            $table->bigInteger('y_coordinate');
            $table->timestamps();

            $table->unique(['template_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists(self::TABLE_NAME);
    }
};
