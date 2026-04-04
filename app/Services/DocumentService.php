<?php

namespace App\Services;

use App\Http\Requests\DocumentStoreRequest;
use App\Models\Document;
use App\Models\Template;
use App\Modules\TemplateFilling\TemplateFillingFacade;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

readonly class DocumentService
{
    public function __construct(
        private TemplateFillingFacade $templateFillingFacade,
        private FileService $fileService,
    )
    {
    }

    /**
     * @return Collection<int, Document>
     */
    public function getAllByUserId(int $userId): Collection
    {
        return Document::query()->with(['template'])->where('user_id', $userId)->get();
    }

    public function delete(Document $document): void
    {
        $document->delete();
    }

    public function create(DocumentStoreRequest $request): Document
    {
        $template = Template::query()->where('id', $request->input('template_id'))->firstOrFail();

        $filledTemplatePath = $this->templateFillingFacade->fill($template, $request->file('file'));

        return DB::transaction(function () use ($template, $filledTemplatePath, $request) {
            $documentName = $request->input('name');
            $userId = $request->user()->id;

            $file = $this->fileService->create($filledTemplatePath);

            return Document::query()->create([
                'file_id' => $file->id,
                'template_id' => $template->id,
                'user_id' => $userId,
                'name' => $documentName,
            ]);
        });
    }
}
