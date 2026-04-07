import { useEffect, useRef, useState } from 'react';
import InputError from '@/Components/InputError';
import { mmToPx, pxToMm, MIN_FIELD_SIZE_MM, PDF_SCALE } from '@/lib/pdfCoords';

function NumericInput({ value, min = 0, onChange, className, ...props }) {
    const [local, setLocal] = useState(String(value));
    const committed = useRef(value);

    // Sync when external value changes (e.g. drag/resize).
    useEffect(() => {
        if (committed.current !== value) {
            committed.current = value;
            setLocal(String(value));
        }
    }, [value]);

    return (
        <input
            type="text"
            inputMode="numeric"
            value={local}
            onChange={(e) => setLocal(e.target.value.replace(/[^0-9]/g, ''))}
            onBlur={() => {
                const v = parseInt(local, 10);
                const clamped = Number.isNaN(v) ? committed.current : Math.max(min, v);
                committed.current = clamped;
                setLocal(String(clamped));
                onChange(clamped);
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter') e.target.blur();
            }}
            className={className}
            {...props}
        />
    );
}

export default function FieldsPanel({
    fields,
    fonts,
    fontColors,
    selectedIndex,
    onSelect,
    onChange,
    onDelete,
    errors,
}) {
    const refs = useRef({});
    const measuringRef = useRef(null);
    const [collapsed, setCollapsed] = useState(new Set());
    const prevVisibleLenRef = useRef(0);

    const toggleCollapse = (key) => {
        setCollapsed((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const visible = fields
        .map((f, idx) => ({ field: f, idx }))
        .filter(({ field }) => !field.is_deleted);

    // When a new field is added collapse all existing ones so only the new one is expanded.
    useEffect(() => {
        if (visible.length > prevVisibleLenRef.current && visible.length > 1) {
            const newKey = (() => {
                const last = visible[visible.length - 1].field;
                return last._clientId ?? last.id ?? visible[visible.length - 1].idx;
            })();
            setCollapsed(new Set(
                visible.slice(0, -1).map(({ field, idx }) => field._clientId ?? field.id ?? idx)
            ));
            // Ensure the new field is not in the collapsed set.
            setCollapsed((prev) => { const s = new Set(prev); s.delete(newKey); return s; });
        }
        prevVisibleLenRef.current = visible.length;
    }, [visible.length]);

    useEffect(() => {
        if (selectedIndex == null) return;
        const node = refs.current[selectedIndex];
        if (node) node.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    return (
        <aside className="border rounded-md bg-gray-50 p-3 w-80 flex-shrink-0 max-h-[800px] overflow-y-auto [scrollbar-gutter:stable]">
            <h3 className="font-semibold text-gray-800 mb-2">Fields ({visible.length})</h3>

            {visible.length === 0 && (
                <p className="text-sm text-gray-500">
                    Click on the PDF to add a field.
                </p>
            )}

            {visible.map(({ field, idx }) => {
                const isSelected = idx === selectedIndex;
                const key = field._clientId ?? field.id ?? idx;
                const isCollapsed = collapsed.has(key);
                const fieldErrors = Object.keys(errors)
                    .filter((k) => k.startsWith(`fields.${idx}.`));
                return (
                    <div
                        key={key}
                        ref={(el) => { refs.current[idx] = el; }}
                        className={`mb-2 border rounded p-2 cursor-pointer ${
                            isSelected ? 'border-blue-500 bg-white' : 'border-gray-200 bg-white'
                        }`}
                        onClick={() => onSelect(idx)}
                    >
                        <div className="text-xs text-gray-500 mb-1">Field Name</div>
                        <div className="flex items-start justify-between mb-1">
                            <textarea
                                value={field.name}
                                onChange={(e) => onChange(idx, { ...field, name: e.target.value })}
                                onClick={(e) => e.stopPropagation()}
                                autoComplete="off"
                                spellCheck="false"
                                data-lpignore="true"
                                data-1p-ignore="true"
                                rows={1}
                                ref={(el) => {
                                    if (!el) return;
                                    if (isCollapsed) {
                                        el.style.height = '';
                                    } else {
                                        el.style.height = 'auto';
                                        el.style.height = el.scrollHeight + 'px';
                                    }
                                }}
                                className="text-sm font-medium border-gray-300 rounded w-full min-w-0 mr-2 resize-none overflow-hidden"
                            />
                            <div
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={(e) => { e.stopPropagation(); toggleCollapse(key); }}
                                className="text-gray-400 hover:text-gray-600 px-1 cursor-pointer select-none flex-shrink-0"
                            >
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 12 12"
                                    fill="currentColor"
                                    className={`block transition-transform duration-150 ${isCollapsed ? '-rotate-90' : ''}`}
                                >
                                    <path d="M6 8L1 3h10z" />
                                </svg>
                            </div>
                            <span
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={(e) => { e.stopPropagation(); onDelete(idx); }}
                                className="text-red-500 hover:text-red-700 px-1 text-sm leading-none cursor-pointer select-none"
                            >
                                ✕
                            </span>
                        </div>

                        {!isCollapsed && (
                            <div className="space-y-2 text-xs mt-2">
                                <label className="block">
                                    Preview Text
                                    <textarea
                                        value={field.preview_text ?? ''}
                                        onChange={(e) => {
                                            const newText = e.target.value;
                                            const patch = { ...field, preview_text: newText };
                                            const m = measuringRef.current;
                                            if (m) {
                                                m.style.width = mmToPx(field.width, PDF_SCALE) + 'px';
                                                m.style.fontSize = (field.font_size * PDF_SCALE) + 'px';
                                                m.value = newText;
                                                const neededMm = Math.max(MIN_FIELD_SIZE_MM, pxToMm(m.scrollHeight + 8, PDF_SCALE));
                                                if (neededMm > field.height) {
                                                    patch.height = neededMm;
                                                }
                                            }
                                            onChange(idx, patch);
                                        }}
                                        onInput={(e) => {
                                            e.target.style.height = 'auto';
                                            e.target.style.height = e.target.scrollHeight + 'px';
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        placeholder="sample text…"
                                        rows={1}
                                        ref={(el) => {
                                            if (!el) return;
                                            el.style.height = 'auto';
                                            el.style.height = el.scrollHeight + 'px';
                                        }}
                                        className="mt-1 block w-full text-xs border-gray-300 rounded resize-none overflow-hidden"
                                    />
                                </label>

                                <div className="flex gap-2">
                                    <label className="flex-1">
                                        Font
                                        <select
                                            value={field.font_id}
                                            onChange={(e) => onChange(idx, { ...field, font_id: Number(e.target.value) })}
                                            onClick={(e) => e.stopPropagation()}
                                            className="mt-1 block w-full text-xs border-gray-300 rounded"
                                        >
                                            {fonts.map((f) => (
                                                <option key={f.id} value={f.id}>{f.name}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="w-16">
                                        Size
                                        <NumericInput
                                            min={1}
                                            value={field.font_size}
                                            onChange={(v) => onChange(idx, { ...field, font_size: v })}
                                            onClick={(e) => e.stopPropagation()}
                                            className="mt-1 block w-full text-xs border-gray-300 rounded"
                                        />
                                    </label>
                                </div>

                                <label className="block">
                                    Font Color
                                    <select
                                        value={field.font_color}
                                        onChange={(e) => onChange(idx, { ...field, font_color: e.target.value })}
                                        onClick={(e) => e.stopPropagation()}
                                        className="mt-1 block w-full text-xs border-gray-300 rounded"
                                    >
                                        {fontColors.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </label>

                                <div className="grid grid-cols-2 gap-2">
                                    <label>
                                        X (mm)
                                        <NumericInput
                                            min={0}
                                            value={field.x_coordinate}
                                            onChange={(v) => onChange(idx, { ...field, x_coordinate: v })}
                                            onClick={(e) => e.stopPropagation()}
                                            className="mt-1 block w-full text-xs border-gray-300 rounded"
                                        />
                                    </label>
                                    <label>
                                        Y (mm)
                                        <NumericInput
                                            min={0}
                                            value={field.y_coordinate}
                                            onChange={(v) => onChange(idx, { ...field, y_coordinate: v })}
                                            onClick={(e) => e.stopPropagation()}
                                            className="mt-1 block w-full text-xs border-gray-300 rounded"
                                        />
                                    </label>
                                    <label>
                                        Width (mm)
                                        <NumericInput
                                            min={1}
                                            value={field.width}
                                            onChange={(v) => onChange(idx, { ...field, width: v })}
                                            onClick={(e) => e.stopPropagation()}
                                            className="mt-1 block w-full text-xs border-gray-300 rounded"
                                        />
                                    </label>
                                    <label>
                                        Height (mm)
                                        <NumericInput
                                            min={1}
                                            value={field.height}
                                            onChange={(v) => onChange(idx, { ...field, height: v })}
                                            onClick={(e) => e.stopPropagation()}
                                            className="mt-1 block w-full text-xs border-gray-300 rounded"
                                        />
                                    </label>
                                </div>

                                {fieldErrors.map((k) => (
                                    <InputError key={k} message={errors[k]} />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
            <textarea
                ref={measuringRef}
                aria-hidden="true"
                readOnly
                tabIndex={-1}
                style={{
                    position: 'fixed',
                    left: '-9999px',
                    top: '-9999px',
                    overflow: 'hidden',
                    resize: 'none',
                    padding: 0,
                    border: 0,
                    margin: 0,
                    lineHeight: '1.2',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    height: 0,
                }}
            />
        </aside>
    );
}
