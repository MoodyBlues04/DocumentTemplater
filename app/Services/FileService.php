<?php

namespace App\Services;

use App\Models\File;
use Illuminate\Http\UploadedFile;

class FileService
{
    public function store(string $fileName, string $storagePath, int $ownerId, UploadedFile $uploadedFile): File
    {
        $fullStoragePath = "$storagePath/$ownerId";
        $path = $uploadedFile->storeAs($fullStoragePath, $fileName, 'public');
        return $this->create($path);
    }

    public function create(string $path): File
    {
        return File::query()->create([
            'path' => $path
        ]);
    }
}
