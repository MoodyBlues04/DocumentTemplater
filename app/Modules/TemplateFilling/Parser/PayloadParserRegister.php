<?php

namespace App\Modules\TemplateFilling\Parser;

use App\Modules\TemplateFilling\Dto\PayloadType;

readonly class PayloadParserRegister
{
    /**
     * @param PayloadParser[] $parsers
     */
    public function __construct(
        private iterable $parsers,
    )
    {
    }

    public function get(PayloadType $payloadType): PayloadParser
    {
        return collect($this->parsers)
            ->filter(fn (PayloadParser $parser) => $parser->supports($payloadType))
            ->firstOrFail();
    }
}
