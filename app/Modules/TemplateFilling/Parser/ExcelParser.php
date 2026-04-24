<?php

namespace App\Modules\TemplateFilling\Parser;

use App\Exceptions\TemplateFillingException;
use App\Modules\TemplateFilling\Dto\Payload;
use App\Modules\TemplateFilling\Dto\PayloadItem;
use App\Modules\TemplateFilling\Dto\PayloadType;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Facades\Excel;

class ExcelParser implements PayloadParser
{
    private const SUPPORTED_TYPES = [PayloadType::CSV, PayloadType::XLS, PayloadType::XLSX];

    public function supports(PayloadType $payloadType): bool
    {
        return in_array($payloadType, self::SUPPORTED_TYPES);
    }

    public function parse(UploadedFile $payloadFile, array $fields): Payload
    {
        $sheets = Excel::toArray([], $payloadFile);
        if (empty($sheets)) {
            throw new TemplateFillingException('Empty payload');
        }

        $payload = new Payload();
        foreach ($sheets as $sheet) {
            $headers = array_filter($this->getHeaders($sheet));
            if (collect($fields)->diff($headers)->isNotEmpty()) {
                throw new TemplateFillingException('Received illegal fields for chosen template');
            }

            collect($sheet)
                ->skip(1)
                ->map(
                    fn ($row) => collect($row)
                        ->only(array_keys($headers))
                        ->filter(fn ($value) => !empty($value))
                        ->mapWithKeys(fn ($value, $columnIdx) => [$headers[$columnIdx] => $value])
                        ->collect()
                )
                ->filter(fn ($row) => $row->isNotEmpty())
                ->map(function (Collection $row) use ($fields) {
                    $payloadItem = new PayloadItem();

                    $row->each(fn ($value, $headerName) => $payloadItem->set($headerName, $value));

                    if (collect($fields)->diff($payloadItem->getFields())->isNotEmpty()) {
                        throw TemplateFillingException::illegalFields($fields, $payloadItem->getFields());
                    }

                    return $payloadItem;
                })
                ->each(fn ($payloadItem) => $payload->add($payloadItem));
        }

        return $payload;
    }

    private function getHeaders(array $sheet): array
    {
        return $sheet[0] ?? throw new TemplateFillingException('Cannot get sheets headers');
    }
}
