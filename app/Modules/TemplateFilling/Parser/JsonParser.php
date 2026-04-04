<?php

namespace App\Modules\TemplateFilling\Parser;

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

    public function parse(UploadedFile $payloadFile): Payload
    {
        $content = $payloadFile->getContent();
        $rawPayload = json_decode($content, true);
        if (empty($rawPayload)) {
            throw new \InvalidArgumentException('Empty json payload');
        }

        $this->assertAllItemsHaveSameFields($rawPayload);

        $payload = new Payload();
        collect($rawPayload)
            ->map(function ($rawPayloadItem) {
                $payloadItem = new PayloadItem();
                collect($rawPayloadItem)
                    ->each(fn ($value, $fieldName) => $payloadItem->set($fieldName, $value));
                return $payloadItem;
            })
            ->each(fn (PayloadItem $payloadItem) => $payload->add($payloadItem));

        return $payload;
    }

    private function assertAllItemsHaveSameFields(array $rawPayload): void
    {
        $firstItemHeaders = array_keys($rawPayload[0]);
        $allItemsHaveSameHeaders = collect($rawPayload)
            ->filter(fn ($rawPayloadItem) => collect($firstItemHeaders)->diff(array_keys($rawPayloadItem))->isNotEmpty())
            ->isEmpty();

        if (!$allItemsHaveSameHeaders) {
            throw new \InvalidArgumentException('Some items of provided payload have different field names');
        }
    }
}
