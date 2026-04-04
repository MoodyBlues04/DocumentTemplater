<?php

namespace App\Services;

use App\Http\Requests\TemplateStoreRequest;
use App\Http\Requests\TemplateUpdateRequest;
use App\Models\Enum\Orientation;
use App\Models\Template;
use App\Models\TemplateField;
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

    public function delete(Template $template): void
    {
        $template->delete();
    }

    public function create(TemplateStoreRequest $request): Template
    {
        return DB::transaction(function () use ($request) {
            $userId = $request->user()->id;
            $templateName = $request->input('name');
            $templateOrientation = Orientation::from($request->input('orientation'));
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
                'orientation' => $templateOrientation,
            ]);
        });
    }

    public function update(TemplateUpdateRequest $request, Template $template)
    {
        return DB::transaction(function () use ($request, $template) {
            $template->name = $request->input('name');
            $template->save();

            $this->deleteFields($request, $template->id);
            $this->upsertFields($request, $template->id);
        });
    }

    private function deleteFields(TemplateUpdateRequest $request, int $templateId): void
    {
        $templateFieldIdsToDelete = $request->collect('fields')
            ->filter(fn ($field) => $field['is_deleted'] === true)
            ->pluck('id')
            ->unique()
            ->all();

        $deletedCount = TemplateField::query()
            ->where('template_id', $templateId)
            ->where('id', 'in', $templateFieldIdsToDelete)
            ->delete();

        if (count($templateFieldIdsToDelete) !== $deletedCount) {
            throw new \RuntimeException('Cannot delete some fields'); // todo custom exception + handler
        }
    }

    private function upsertFields(TemplateUpdateRequest $request, int $templateId): void
    {
        $updatedTemplateFields = $request->collect('fields')
            ->filter(fn ($field) => $field['is_deleted'] === false)
            ->map(fn ($templateField) => array_merge($templateField, ['template_id' => $templateId]))
            ->all();

        TemplateField::query()->upsert($updatedTemplateFields, ['id']);
    }
}
