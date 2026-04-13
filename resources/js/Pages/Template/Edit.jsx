import { useForm, Head, router } from '@inertiajs/react';
import { useState, useMemo, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PdfCanvas from '@/Components/Template/PdfCanvas';
import FieldRect from '@/Components/Template/FieldRect';
import FieldsPanel from '@/Components/Template/FieldsPanel';
import InputError from '@/Components/InputError';
import {
    pxToMm,
    mmToPx,
    PDF_SCALE,
    DEFAULT_FIELD_WIDTH_MM,
    DEFAULT_FIELD_HEIGHT_MM,
} from '@/lib/pdfCoords';

function seedNameCounter(rawFields) {
    const max = (rawFields ?? [])
        .map((f) => /^field_(\d+)$/.exec(f.name)?.[1])
        .filter(Boolean)
        .map(Number)
        .reduce((a, b) => Math.max(a, b), 0);
    return max;
}

export default function TemplatesEdit({ template, fileUrl, fonts, fontColors }) {
    const clientIdSeqRef = useRef(0);
    const nextClientId = () => `cid_${++clientIdSeqRef.current}`;

    // Compute initial fields once; useForm captures its argument on the first render only.
    const [initialFields] = useState(() =>
        (template.fields ?? []).map((f) => ({
            _clientId: nextClientId(),
            id: f.id,
            is_deleted: false,
            name: f.name,
            font_id: f.font_id ?? f.font?.id,
            font_size: f.font_size,
            font_color: f.font_color,
            x_coordinate: f.x_coordinate,
            y_coordinate: f.y_coordinate,
            width: f.width,
            height: f.height,
        }))
    );

    const { data, setData, put, transform, processing, errors } = useForm({
        name: template.name,
        orientation: template.orientation,
        fields: initialFields,
    });

    // Strip client-only keys before every submission.
    transform((d) => ({
        ...d,
        fields: d.fields.map(
            ({ _clientId: _cid, font: _font, preview_text: _previewText, ...rest }) => rest
        ),
    }));

    const [docSizeMm, setDocSizeMm] = useState({ width: 0, height: 0 });
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [nameCounter, setNameCounter] = useState(() => seedNameCounter(template.fields));
    const [zoom, setZoom] = useState(1);
    const [zoomInput, setZoomInput] = useState('100');
    const pdfContainerRef = useRef(null);
    const fitZoomDoneRef = useRef(false);
    const scale = PDF_SCALE * zoom;

    const applyZoom = (raw) => {
        const v = parseInt(raw, 10);
        const clamped = Number.isNaN(v) ? zoom * 100 : Math.min(400, Math.max(10, v));
        setZoom(clamped / 100);
        setZoomInput(String(clamped));
    };

    const stepZoom = (delta) => {
        const next = Math.min(400, Math.max(10, Math.round(zoom * 100) + delta));
        setZoom(next / 100);
        setZoomInput(String(next));
    };

    const visibleFields = useMemo(
        () => data.fields
            .map((f, idx) => ({ field: f, idx }))
            .filter(({ field }) => !field.is_deleted),
        [data.fields]
    );

    const updateField = (idx, patch) => {
        const next = data.fields.slice();
        if (docSizeMm.width > 0 && docSizeMm.height > 0) {
            const w = Math.max(1, Math.min(patch.width,  docSizeMm.width));
            const h = Math.max(1, Math.min(patch.height, docSizeMm.height));
            const x = Math.max(0, Math.min(patch.x_coordinate, docSizeMm.width  - w));
            const y = Math.max(0, Math.min(patch.y_coordinate, docSizeMm.height - h));
            next[idx] = { ...patch, x_coordinate: x, y_coordinate: y, width: w, height: h };
        } else {
            next[idx] = patch;
        }
        setData('fields', next);
    };

    const deleteField = (idx) => {
        const next = data.fields.slice();
        next[idx] = { ...next[idx], is_deleted: true };
        setData('fields', next);
        if (selectedIndex === idx) setSelectedIndex(null);
    };

    const addFieldAtPx = (xPx, yPx) => {
        const newCounter = nameCounter + 1;
        setNameCounter(newCounter);

        const defaultFontId = fonts[0]?.id;
        if (!defaultFontId) {
            console.warn('No fonts available — cannot create field');
            return;
        }

        const xMm = pxToMm(xPx, scale);
        const yMm = pxToMm(yPx, scale);
        const clampedX = docSizeMm.width  > 0 ? Math.min(xMm, Math.max(0, docSizeMm.width  - DEFAULT_FIELD_WIDTH_MM))  : xMm;
        const clampedY = docSizeMm.height > 0 ? Math.min(yMm, Math.max(0, docSizeMm.height - DEFAULT_FIELD_HEIGHT_MM)) : yMm;

        const newField = {
            _clientId: nextClientId(),
            id: null,
            is_deleted: false,
            name: `field_${newCounter}`,
            font_id: defaultFontId,
            font_size: 12,
            font_color: fontColors[0] ?? 'black',
            x_coordinate: clampedX,
            y_coordinate: clampedY,
            width: DEFAULT_FIELD_WIDTH_MM,
            height: DEFAULT_FIELD_HEIGHT_MM,
        };
        const next = [...data.fields, newField];
        setData('fields', next);
        setSelectedIndex(next.length - 1);
    };

    const fieldValidationErrors = useMemo(() => {
        const activeNames = visibleFields.map(({ field }) => field.name);
        const errs = [];
        const emptyCount = activeNames.filter((n) => !n).length;
        if (emptyCount > 0) errs.push(`${emptyCount} field(s) have an empty name`);
        const seen = new Set();
        const dupes = new Set();
        for (const n of activeNames) { if (n && seen.has(n)) dupes.add(n); seen.add(n); }
        if (dupes.size > 0) errs.push(`Duplicate field names: ${[...dupes].join(', ')}`);
        return errs;
    }, [visibleFields]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (fieldValidationErrors.length > 0) return;
        put(route('template.update', template.id), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Template</h2>}
        >
            <Head title="Edit Template" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Template PDF (click to add a field)
                                        </label>
                                        <div className="ml-auto flex items-center gap-1 text-sm">
                                            <button
                                                type="button"
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => stepZoom(-10)}
                                                className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 font-bold leading-none"
                                            >−</button>
                                            <div className="flex items-center">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={zoomInput}
                                                    onChange={(e) => setZoomInput(e.target.value.replace(/[^0-9]/g, ''))}
                                                    onBlur={(e) => applyZoom(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyZoom(e.target.value); e.target.blur(); } }}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    onClick={(e) => { e.stopPropagation(); e.target.select(); }}
                                                    className="w-14 text-center text-gray-600 tabular-nums border-gray-300 rounded text-sm py-1"
                                                />
                                                <span className="ml-1 text-gray-500">%</span>
                                            </div>
                                            <button
                                                type="button"
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => stepZoom(10)}
                                                className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 font-bold leading-none"
                                            >+</button>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div ref={pdfContainerRef} className="w-3/4 min-w-0 overflow-auto">
                                            <PdfCanvas
                                                fileUrl={fileUrl}
                                                scale={scale}
                                                onCanvasClick={addFieldAtPx}
                                                onSizeChange={(w, h) => {
                                                    setDocSizeMm({ width: w, height: h });
                                                    if (!fitZoomDoneRef.current && w > 0 && pdfContainerRef.current) {
                                                        fitZoomDoneRef.current = true;
                                                        const containerW = pdfContainerRef.current.offsetWidth;
                                                        const pdfPxAt1 = mmToPx(w, PDF_SCALE);
                                                        const fit = Math.floor((containerW / pdfPxAt1) * 100);
                                                        const clamped = Math.min(400, Math.max(10, fit));
                                                        setZoom(clamped / 100);
                                                        setZoomInput(String(clamped));
                                                    }
                                                }}
                                            >
                                                {visibleFields.map(({ field, idx }) => (
                                                    <FieldRect
                                                        key={field._clientId ?? field.id ?? idx}
                                                        field={field}
                                                        scale={scale}
                                                        docWidthMm={docSizeMm.width}
                                                        docHeightMm={docSizeMm.height}
                                                        selected={idx === selectedIndex}
                                                        onSelect={() => setSelectedIndex(idx)}
                                                        onChange={(patch) => updateField(idx, patch)}
                                                    />
                                                ))}
                                            </PdfCanvas>
                                        </div>

                                        <div className="w-1/4 min-w-[220px] overflow-hidden sticky top-4 self-start">
                                            <FieldsPanel
                                                fields={data.fields}
                                                fonts={fonts}
                                                fontColors={fontColors}
                                                selectedIndex={selectedIndex}
                                                onSelect={setSelectedIndex}
                                                onChange={updateField}
                                                onDelete={deleteField}
                                                errors={errors}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end space-x-3">
                                    {fieldValidationErrors.length > 0 && (
                                        <ul className="text-red-600 text-sm mr-auto list-disc list-inside">
                                            {fieldValidationErrors.map((e) => <li key={e}>{e}</li>)}
                                        </ul>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => router.visit(route('template.index'))}
                                        className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition duration-150"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing || fieldValidationErrors.length > 0}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'Saving…' : 'Save Template'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
