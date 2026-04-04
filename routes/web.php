<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () { // todo change
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () { // todo remove/change
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::resource('template', \App\Http\Controllers\TemplateController::class)
        ->except(['show']);

    Route::resource('document', \App\Http\Controllers\DocumentController::class)
        ->except(['edit', 'update', 'show']);
    Route::post('/document/{id}/download', [\App\Http\Controllers\DocumentController::class, 'download'])
        ->name('document.download');
});

require __DIR__.'/auth.php';
