<?php

namespace App\Services;

use App\Http\Requests\TemplateStoreRequest;
use App\Models\Template;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

readonly class TemplateService
{
    private const TEMPLATE_FILE_STORAGE_DIR = 'templates';
    private const TEMPLATE_FILE_EXTENSION = '.pdf';

    public function __construct(private FileService $fileService)
    {
    }

    /**
     * @return Collection<int, Template>
     */
    public function getAllByUserId(int $userId): Collection
    {
        return Template::query()->with(['file', 'fields'])->where('user_id', $userId)->get();
    }

    public function create(TemplateStoreRequest $request): Template
    {
        return DB::transaction(function () use ($request) {
            $userId = $request->user()->id;
            $templateName = $request->input('name');
            $now = now()->timestamp;

            $file = $this->fileService->create(
                 "$templateName-$now" . self::TEMPLATE_FILE_EXTENSION,
                self::TEMPLATE_FILE_STORAGE_DIR,
                $userId,
                $request->file('file')
            );
            return Template::query()->create([
                'file_id' => $file->id,
                'user_id' => $userId,
                'name' => $templateName,
            ]);
        });
    }

    public function delete(Template $template): void
    {
        $template->delete();
    }
}
