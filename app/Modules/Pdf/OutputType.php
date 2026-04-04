<?php

namespace App\Modules\Pdf;

enum OutputType: string
{
    case BROWSER = 'I';
    case FILE = 'F';
}
