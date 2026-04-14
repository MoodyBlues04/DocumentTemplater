<?php

namespace App\Http\Controllers;

use App\Http\Requests\TemplateStoreRequest;
use App\Http\Requests\TemplateUpdateRequest;
use App\Models\Enum\FontColor;
use App\Models\Enum\Orientation;
use App\Models\Template;
use App\Services\FontService;
use App\Services\TemplateService;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class TemplateController extends Controller
{
    public function __construct(
        private readonly TemplateService $templateService,
        private readonly FontService $fontService,
    )
    {
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $templates = $this->templateService->getAllByUserId(auth()->id())
            ->sortBy('id', SORT_ASC)
            ->all();

        return Inertia::render('Template/Index', [
            'templates' => $templates,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        Gate::authorize('create', Template::class);

        return Inertia::render('Template/Create', [
            'orientations' => Orientation::cases(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(TemplateStoreRequest $request)
    {
        Gate::authorize('create', Template::class);

        $template = $this->templateService->create($request);

        return redirect()
            ->route('template.edit', $template)
            ->with('success', "Template '$template->name' created successfully");
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Template $template)
    {
        Gate::authorize('update', $template);

        return Inertia::render('Template/Edit', [
            'template' => $template->load('file'),
            'orientations' => Orientation::cases(),
            'fonts' => $this->fontService->getAll()->all(),
            'fontColors' => FontColor::cases(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(TemplateUpdateRequest $request, Template $template)
    {
        Gate::authorize('update', $template);

        $this->templateService->update($request, $template);

        return redirect()
            ->route('template.index')
            ->with('success', "Template '$template->name' updated successfully");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Template $template)
    {
        Gate::authorize('delete', $template);

        $this->templateService->delete($template);

        return redirect()
            ->route('template.index')
            ->with('success', "Template '$template->name' deleted successfully!");
    }
}
