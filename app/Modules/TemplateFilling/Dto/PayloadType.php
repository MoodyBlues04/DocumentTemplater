<?php

namespace App\Modules\TemplateFilling\Dto;

enum PayloadType: string
{
    case XLSX = 'xlsx';
    case XLS = 'xls';
    case CSV = 'csv';
    case JSON = 'json';

    public static function fromExtension(string $extension): self
    {
        return collect(PayloadType::cases())
            ->filter(fn (PayloadType $payloadType) => $payloadType->value === $extension)
            ->firstOrFail();
    }
}
