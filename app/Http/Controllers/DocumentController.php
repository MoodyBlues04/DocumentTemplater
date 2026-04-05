<?php

namespace App\Http\Controllers;

use App\Http\Requests\DocumentCreateRequest;
use App\Http\Requests\DocumentStoreRequest;
use App\Models\Document;
use App\Services\DocumentService;
use App\Services\TemplateService;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function __construct(
        private readonly DocumentService $documentService,
        private readonly TemplateService $templateService,
    )
    {
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $documents = $this->documentService->getAllByUserId(auth()->user()->id)
            ->sortBy('id', SORT_ASC)
            ->all();

        return Inertia::render('Document/Index', [
            'documents' => $documents,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(DocumentCreateRequest $request)
    {
        Gate::authorize('create', Document::class);

        $templates = $this->templateService->getAllByUserId(auth()->user()->id)->all();

        return Inertia::render('Document/Create', [
            'templates' => $templates,
            'template_id' => $request->query('template_id')
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(DocumentStoreRequest $request)
    {
        Gate::authorize('create', Document::class);

        $document = $this->documentService->create($request);

        return redirect()
            ->route('document.index')
            ->with("Document '$document->name' filled successfully");
    }

    /**
     * Display the specified resource.
     */
    public function download(Document $document)
    {
        Gate::authorize('view', $document);

        return response()->download(
            $document->file->getFullPath(),
            "$document->name.{$document->file->getExtension()}"
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Document $document)
    {
        Gate::authorize('delete', $document);

        $this->documentService->delete($document);

        return redirect()
            ->route('document.index')
            ->with('success', "Document $document->name deleted successfully");
    }
}
