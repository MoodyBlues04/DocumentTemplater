<?php

namespace App\Models\ValueObject;

class Coordinates
{
    public function __construct(
        public int $x,
        public int $y,
    )
    {
    }
}
