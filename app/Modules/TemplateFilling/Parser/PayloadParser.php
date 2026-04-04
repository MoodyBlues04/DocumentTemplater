<?php

namespace App\Modules\TemplateFilling\Parser;

use App\Modules\TemplateFilling\Dto\Payload;
use App\Modules\TemplateFilling\Dto\PayloadType;
use Illuminate\Http\UploadedFile;

interface PayloadParser
{
    public function supports(PayloadType $payloadType): bool;

    /**
     * @param string[] $fields
     */
    public function parse(UploadedFile $payloadFile, array $fields): Payload;
}
