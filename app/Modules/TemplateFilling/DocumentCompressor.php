<?php

namespace App\Modules\TemplateFilling;

use App\Models\Template;
use App\Modules\Zip\FileArchivator;
use Illuminate\Support\Facades\Storage;

readonly class DocumentCompressor
{
    public function __construct(private FileArchivator $fileArchivator)
    {
    }

    public function compress(Template $template, string $documentsBufferDir): string
    {
        $archiveFilePath = $this->getArchiveFilePath($template);
        $archiveFullPath = Storage::disk('public')->path($archiveFilePath);

        Storage::disk('public')->makeDirectory(dirname($archiveFilePath));

        $this->fileArchivator->archive($documentsBufferDir, $archiveFullPath);

        Storage::deleteDirectory($documentsBufferDir);

        return $archiveFilePath;
    }

    private function getArchiveFilePath(Template $template): string
    {
        $now = now()->timestamp;
        return "/documents/archives/$template->user_id/$template->name-$now.zip";
    }
}
