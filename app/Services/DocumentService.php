<?php

namespace App\Services;

use App\Http\Requests\DocumentStoreRequest;
use App\Models\Document;
use Illuminate\Database\Eloquent\Collection;

readonly class DocumentService
{
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
        return new Document();
    }
}
