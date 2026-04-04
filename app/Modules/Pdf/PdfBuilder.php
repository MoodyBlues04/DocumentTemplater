<?php

namespace App\Modules\Pdf;

use App\Models\Enum\FontColor;
use App\Models\Enum\Orientation;
use App\Models\Font;
use App\Models\ValueObject\Coordinates;
use App\Models\ValueObject\Size;
use setasign\Fpdi\PdfParser\CrossReference\CrossReferenceException;
use setasign\Fpdi\PdfParser\Filter\FilterException;
use setasign\Fpdi\PdfParser\PdfParserException;
use setasign\Fpdi\PdfParser\Type\PdfTypeException;
use setasign\Fpdi\PdfReader\PdfReaderException;
use setasign\Fpdi\Tfpdf\Fpdi;

readonly class PdfBuilder
{
    private const ALIGN_CENTER = 'C';

    private function __construct(private Fpdi $pdf)
    {
    }

    /**
     * @param Font[] $fonts
     * @throws CrossReferenceException
     * @throws PdfReaderException
     * @throws PdfParserException
     * @throws PdfTypeException
     * @throws FilterException
     */
    public static function fromTemplate(
        string $templateFilePath,
        Orientation $orientation = Orientation::VERTICAL,
        array $fonts = [],
    ): self {
        $pdf = new Fpdi();

        $pdf->setSourceFile($templateFilePath);

        $tpl = $pdf->importPage(1);
        $pdf->AddPage(self::getFpdfOrientation($orientation));

        $pdf->useTemplate($tpl);

        return (new self($pdf))->addFonts($fonts);
    }

    /**
     * @param Font[] $fonts
     */
    public function addFonts(array $fonts): self
    {
        collect($fonts)->each(fn (Font $font) =>
            $this->pdf->AddFont($font->name, file: $font->font_definition_file, uni: $font->is_unicode)
        );
        return $this;
    }

    public function setFont(string $fontName, int $fontSize): self
    {
        $this->pdf->SetFont($fontName, size: $fontSize);
        return $this;
    }

    public function setFontColor(FontColor $fontColor): self
    {
        $this->pdf->SetTextColor(...$fontColor->getRgb());
        return $this;
    }

    public function write(string $value, Coordinates $coordinates, Size $cellSize): self
    {
        $this->pdf->SetXY($coordinates->x, $coordinates->y);
        $this->pdf->Cell(
            w: $cellSize->width,
            h: $cellSize->height,
            txt: $value,
            align: self::ALIGN_CENTER
        );
        return $this;
    }

    public function save(OutputType $outputType, string $descFilePath): void
    {
        $this->pdf->Output($outputType->value, $descFilePath);
    }

    private static function getFpdfOrientation(Orientation $orientation): string
    {
        return match ($orientation) {
            Orientation::VERTICAL => '',
            Orientation::HORIZONTAL => 'L',
        };
    }
}
