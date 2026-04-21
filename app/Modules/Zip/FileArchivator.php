<?php

namespace App\Modules\Zip;

use App\Exceptions\IOException;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use SplFileInfo;
use ZipArchive;

readonly class FileArchivator
{
    public function archive(string $sourcePath, string $archiveName): bool
    {
        $zip = new ZipArchive();
        $isOpened = $zip->open($archiveName, ZipArchive::CREATE | ZipArchive::OVERWRITE);

        if ($isOpened !== true) {
            throw new IOException("Cannot open zip archive. Error code: $isOpened");
        }

        /** @var SplFileInfo[] $files */
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($sourcePath),
            RecursiveIteratorIterator::LEAVES_ONLY
        );

        foreach ($files as $file) {
            if ($file->isDir()) {
                continue;
            }
            $filePath = $file->getRealPath();
            $zip->addFile($filePath, pathinfo($filePath, PATHINFO_BASENAME));
        }

        return $zip->close();
    }
}
