<?php

namespace App\Modules\TemplateFilling;

use App\Models\Template;
use App\Modules\TemplateFilling\Dto\PayloadType;
use App\Modules\TemplateFilling\Parser\PayloadParserRegister;
use Illuminate\Http\UploadedFile;
use Symfony\Component\HttpFoundation\File\File;

readonly class TemplateFillingFacade
{
    public function __construct(
        private PayloadParserRegister $payloadParserRegister,
    )
    {
    }

    public function fill(Template $template, UploadedFile $payloadFile): File
    {
        // todo 3) TemplateFiller fill template fields
        // todo 4) compress to zip
        // todo 5) return

        $payloadType = PayloadType::fromExtension($payloadFile->extension());
        $parser = $this->payloadParserRegister->get($payloadType);

        $payload = $parser->parse($payloadFile);

        dd($payload);


        return new File($payloadFile->getRealPath());
    }
}
