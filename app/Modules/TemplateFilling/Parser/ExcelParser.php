<?php

namespace App\Modules\TemplateFilling\Parser;

use App\Exceptions\TemplateFillingException;
use App\Modules\TemplateFilling\Dto\Payload;
use App\Modules\TemplateFilling\Dto\PayloadItem;
use App\Modules\TemplateFilling\Dto\PayloadType;
use Illuminate\Http\UploadedFile;
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
            $headers = $this->getHeaders($sheet);
            if (collect($fields)->diff($headers)->isNotEmpty()) {
                throw new TemplateFillingException('Received illegal fields for chosen template');
            }
            collect($sheet)
                ->skip(1)
                ->map(function (array $row) use ($headers) {
                    $payloadItem = new PayloadItem();
                    collect($row)
                        ->each(fn ($value, $columnIdx) => $payloadItem->set(
                            $headers[$columnIdx] ?? throw new TemplateFillingException("No field name configured for column $columnIdx"),
                            $value
                        ));
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
