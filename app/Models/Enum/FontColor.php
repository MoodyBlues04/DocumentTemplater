<?php

namespace App\Models\Enum;

enum FontColor: string
{
    case BLUE = 'blue';
    case BLACK = 'black';
    case GRAY = 'gray';

    private const RGB = [
        self::BLUE->value => [27, 59, 110],
        self::BLACK->value => [0, 0, 0],
        self::GRAY->value => [65, 65, 65],
    ];

    /**
     * @return int[]
     */
    public function getRgb(): array
    {
        return self::RGB[$this->value];
    }
}
