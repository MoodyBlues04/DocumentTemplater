<?php

namespace App\Services\TemplateFilling;

use App\Models\Template;
use Illuminate\Http\UploadedFile;
use Symfony\Component\HttpFoundation\File\File;

readonly class TemplateFillingFacade
{
    public function fill(Template $template, UploadedFile $payload): File
    {
        // todo 1) payload parser get from abstract factory
        // todo 2) parse all rows
        // todo 3) TemplateFiller fill template fields
        // todo 4) compress to zip
        // todo 5) return
        return new File($payload->getRealPath());
    }
}
