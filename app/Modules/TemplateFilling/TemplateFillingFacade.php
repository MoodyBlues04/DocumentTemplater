<?php

namespace App\Modules\TemplateFilling;

use App\Models\Template;
use App\Models\TemplateField;
use App\Modules\TemplateFilling\Dto\PayloadType;
use App\Modules\TemplateFilling\Parser\PayloadParserRegister;
use Illuminate\Http\UploadedFile;
use Symfony\Component\HttpFoundation\File\File;

readonly class TemplateFillingFacade
{
    public function __construct(
        private PayloadParserRegister $payloadParserRegister,
        private TemplateFiller $templateFiller,
        private DocumentCompressor $documentCompressor,
    )
    {
    }

    /**
     * @return string filled template path
     * @throws \setasign\Fpdi\PdfParser\CrossReference\CrossReferenceException
     * @throws \setasign\Fpdi\PdfParser\Filter\FilterException
     * @throws \setasign\Fpdi\PdfParser\PdfParserException
     * @throws \setasign\Fpdi\PdfParser\Type\PdfTypeException
     * @throws \setasign\Fpdi\PdfReader\PdfReaderException
     */
    public function fill(Template $template, UploadedFile $payloadFile): string
    {
        $payloadType = PayloadType::fromExtension($payloadFile->extension());
        $parser = $this->payloadParserRegister->get($payloadType);

        $expectedFieldNames = $template->fields->map(fn (TemplateField $field) => $field->name)->all();

        $payload = $parser->parse($payloadFile, $expectedFieldNames);

        $documentsBufferDir = $this->templateFiller->fill($template, $payload);

        return $this->documentCompressor->compress($template, $documentsBufferDir);
    }
}
