<?php

namespace App\Models\ValueObject;

class Size
{
    public function __construct(
        public int $height,
        public int $width,
    )
    {
    }
}
