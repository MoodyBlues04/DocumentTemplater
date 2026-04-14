<?php

namespace App\Providers;

use App\Modules\TemplateFilling\Parser\ExcelParser;
use App\Modules\TemplateFilling\Parser\JsonParser;
use App\Modules\TemplateFilling\Parser\PayloadParser;
use App\Modules\TemplateFilling\Parser\PayloadParserRegister;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public const PAYLOAD_PARSERS = 'payload_parsers';

    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(PayloadParser::class, ExcelParser::class);
        $this->app->bind(PayloadParser::class, JsonParser::class);

        $this->app->tag([ExcelParser::class, JsonParser::class], self::PAYLOAD_PARSERS);

        $this->app->when(PayloadParserRegister::class)
            ->needs('$parsers')
            ->giveTagged(self::PAYLOAD_PARSERS);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
