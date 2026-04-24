<?php

namespace App\Modules\TemplateFilling\Parser;

use App\Exceptions\TemplateFillingException;
use App\Modules\TemplateFilling\Dto\Payload;
use App\Modules\TemplateFilling\Dto\PayloadItem;
use App\Modules\TemplateFilling\Dto\PayloadType;
use Illuminate\Http\UploadedFile;

class JsonParser implements PayloadParser
{
    public function supports(PayloadType $payloadType): bool
    {
        return $payloadType === PayloadType::JSON;
    }

    public function parse(UploadedFile $payloadFile, array $fields): Payload
    {
        $content = $payloadFile->getContent();
        $rawPayload = json_decode($content, true);
        if (empty($rawPayload)) {
            throw new TemplateFillingException('Empty json payload');
        }

        $payload = new Payload();
        collect($rawPayload)
            ->map(function ($rawPayloadItem) use ($fields) {
                $payloadItem = new PayloadItem();
                collect($rawPayloadItem)
                    ->each(fn ($value, $fieldName) => $payloadItem->set($fieldName, $value));

                if (collect($fields)->diff($payloadItem->getFields())->isNotEmpty()) {
                    throw TemplateFillingException::illegalFields($fields, $payloadItem->getFields());
                }

                return $payloadItem;
            })
            ->each(fn (PayloadItem $payloadItem) => $payload->add($payloadItem));

        return $payload;
    }
}
