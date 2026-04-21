<?php

namespace App\Modules\TemplateFilling\Dto;

use App\Exceptions\TemplateFillingException;

class PayloadItem
{
    private array $data = [];

    public function set(string $field, mixed $value): void
    {
        $this->data[$field] = $value;
    }

    public function get(string $field): mixed
    {
        return $this->data[$field] ?? throw new TemplateFillingException("Invalid payload field: $field");
    }

    /**
     * @return string[]
     */
    public function getFields(): array
    {
        return array_keys($this->data);
    }
}
