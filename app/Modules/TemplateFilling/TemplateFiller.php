<?php

namespace App\Modules\TemplateFilling;

use App\Models\Template;
use App\Models\TemplateField;
use App\Modules\Pdf\OutputType;
use App\Modules\Pdf\PdfBuilder;
use App\Modules\TemplateFilling\Dto\Payload;
use Illuminate\Support\Facades\Storage;
use setasign\Fpdi\PdfParser\CrossReference\CrossReferenceException;
use setasign\Fpdi\PdfParser\Filter\FilterException;
use setasign\Fpdi\PdfParser\PdfParserException;
use setasign\Fpdi\PdfParser\Type\PdfTypeException;
use setasign\Fpdi\PdfReader\PdfReaderException;

readonly class TemplateFiller
{
    /**
     * @return string buffer dir path
     * @throws CrossReferenceException
     * @throws FilterException
     * @throws PdfParserException
     * @throws PdfTypeException
     * @throws PdfReaderException
     */
    public function fill(Template $template, Payload $payload): string
    {
        $bufferDir = $this->getBufferDirPath($template);
        Storage::makeDirectory($bufferDir);

        $fonts = $template->fields->map(fn (TemplateField $field) => $field->font)->all();
        $templateFilePath = $template->file->getFullPath();

        foreach ($payload->all() as $idx => $payloadItem) {
            $pdfBuilder = PdfBuilder::fromTemplate($templateFilePath, $template->orientation, $fonts);

            $template->fields->each(fn (TemplateField $field) =>
                $pdfBuilder
                    ->setFont($field->font->name, $field->font_size)
                    ->setFontColor($field->font_color)
                    ->write(
                        $payloadItem->get($field->name),
                        $field->coordinates,
                        $field->size
                    )
            );

            $filePath = $this->getOutputFilePath($bufferDir, $template->name, $idx);
            $pdfBuilder->save(OutputType::FILE, $filePath);
        }

        return Storage::path($bufferDir);
    }

    private function getBufferDirPath(Template $template): string
    {
        $now = now()->timestamp;
        return "/documents/buffer/{$template->user_id}/$now";
    }

    private function getOutputFilePath(string $bufferDir, string $templateName, int $idx): string
    {
        return Storage::path("$bufferDir/$templateName-$idx.pdf");
    }
}
