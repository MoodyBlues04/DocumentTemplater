<?php

namespace App\Modules\TemplateFilling\Dto;

class PayloadItem
{
    private array $data = [];

    public function set(string $field, mixed $value): void
    {
        $this->data[$field] = $value;
    }

    public function get(string $field): mixed
    {
        return $this->data[$field] ?? throw new \InvalidArgumentException("Invalid payload field: $field");
    }
}
