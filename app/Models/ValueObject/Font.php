<?php

namespace App\Models\ValueObject;

class Font
{
    public function __construct(
        public int $fontSize,
        public string $fontName, // todo enum
        public string $fontColor,
    )
    {
    }
}
