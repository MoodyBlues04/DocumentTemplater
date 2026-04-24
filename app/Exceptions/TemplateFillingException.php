<?php

namespace App\Exceptions;

class TemplateFillingException extends BaseException
{
    public static function illegalFields(array $expectedFields, array $actualFields): self
    {
        [$expectedJson, $actualJson] = array_map(
            fn ($fields) => json_encode($fields, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            [$expectedFields, $actualFields]
        );
        return new self("Received illegal fields for chosen template. Expected: $expectedJson Got: $actualJson");
    }
}
