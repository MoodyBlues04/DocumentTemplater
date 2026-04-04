<?php

namespace App\Modules\TemplateFilling\Dto;

class Payload
{
    /** @var PayloadItem[] */
    private array $items = [];

    public function add(PayloadItem $item): self
    {
        $this->items[] = $item;
        return $this;
    }

    /**
     * @return PayloadItem[]
     */
    public function all(): array
    {
        return $this->items;
    }
}
