<?php

namespace App\Services;

use App\Http\Requests\DocumentStoreRequest;
use App\Models\Document;
use App\Models\Template;
use App\Services\TemplateFilling\TemplateFillingFacade;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

readonly class DocumentService
{
    private const DOCUMENT_STORAGE_DIR = 'documents';

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

        $filledTemplate = $this->templateFillingFacade->fill($template, $request->file('file'));

        return DB::transaction(function () use ($template, $filledTemplate, $request) {
            $documentName = $request->input('name');
            $now = now()->timestamp;
            $userId = $request->user()->id;

            $file = $this->fileService->create(
                "$documentName-$now." . $filledTemplate->getExtension(),
                self::DOCUMENT_STORAGE_DIR,
                $userId,
                $filledTemplate
            );

            return Document::query()->create([
                'file_id' => $file->id,
                'template_id' => $template->id,
                'user_id' => $userId,
                'name' => $documentName,
            ]);
        });
    }
}
