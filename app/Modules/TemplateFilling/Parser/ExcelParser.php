<?php

namespace App\Modules\TemplateFilling\Parser;

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

    public function parse(UploadedFile $payloadFile): Payload
    {
        $sheets = Excel::toArray([], $payloadFile);
        if (empty($sheets)) {
            throw new \InvalidArgumentException('Empty payload'); // todo exceptions
        }

        $this->assertAllSheetsHaveSameHeaders($sheets);

        $payload = new Payload();
        foreach ($sheets as $sheet) {
            $headers = $this->getHeaders($sheet);
            collect($sheet)
                ->skip(1)
                ->map(function (array $row) use ($headers) {
                    $payloadItem = new PayloadItem();
                    collect($row)
                        ->each(fn ($value, $columnIdx) => $payloadItem->set(
                            $headers[$columnIdx] ?? throw new \InvalidArgumentException("No field name configured for column $columnIdx"),
                            $value
                        ));
                    return $payloadItem;
                })
                ->each(fn ($payloadItem) => $payload->add($payloadItem));
        }

        return $payload;
    }

    private function assertAllSheetsHaveSameHeaders(array $sheets): void
    {
        $firstSheetHeaders = $this->getHeaders($sheets[0]);
        $allSheetsHaveSameHeaders = collect($sheets)
            ->filter(fn ($sheet) => collect($firstSheetHeaders)->diff($this->getHeaders($sheet))->isNotEmpty())
            ->isEmpty();

        if (!$allSheetsHaveSameHeaders) {
            throw new \InvalidArgumentException('Some sheets of provided payload have different headers');
        }
    }

    private function getHeaders(array $sheet): array
    {
        return $sheet[0] ?? throw new \InvalidArgumentException('Cannot get sheets headers');
    }
}
