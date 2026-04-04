<?php

namespace App\Services;

use App\Models\File;
use Illuminate\Http\UploadedFile;

class FileService
{
    public function create(string $fileName, string $storagePath, int $ownerId, UploadedFile $uploadedFile): File
    {
        $fullStoragePath = "$storagePath/$ownerId";
        $path = $uploadedFile->storeAs($fullStoragePath, $fileName, 'public');
        return File::query()->create([
            'path' => $path
        ]);
    }
}
