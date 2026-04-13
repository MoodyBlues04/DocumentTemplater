import { useEffect, useRef, useState } from 'react';
import InputError from '@/Components/InputError';

function NumericInput({ value, min = 0, max = Infinity, onChange, className, ...props }) {
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
                const clamped = Number.isNaN(v) ? committed.current : Math.min(max, Math.max(min, v));
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

    const visible = fields
        .map((f, idx) => ({ field: f, idx }))
        .filter(({ field }) => !field.is_deleted);

    useEffect(() => {
        if (selectedIndex == null) return;
        const node = refs.current[selectedIndex];
        if (node) node.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    return (
        <aside className="border rounded-md bg-gray-200 p-3 w-full max-h-[800px] overflow-y-auto [scrollbar-gutter:stable]">
            <h3 className="font-semibold text-gray-800 mb-2">Fields ({visible.length})</h3>

            {visible.length === 0 && (
                <p className="text-sm text-gray-500">
                    Click on the PDF to add a field.
                </p>
            )}

            {visible.map(({ field, idx }) => {
                const isSelected = idx === selectedIndex;
                const key = field._clientId ?? field.id ?? idx;
                const fieldErrors = Object.keys(errors)
                    .filter((k) => k.startsWith(`fields.${idx}.`));
                const isDuplicateName = field.name && visible.some(
                    ({ field: f, idx: i }) => i !== idx && f.name === field.name
                );
                const isEmptyName = !field.name;
                return (
                    <div
                        key={key}
                        ref={(el) => { refs.current[idx] = el; }}
                        style={{ marginBottom: '17px' }}
                        className={`border rounded p-2 ${
                            isSelected ? 'border-blue-500 bg-white' : 'border-gray-200 bg-white'
                        }`}
                    >
                        <div className="flex items-center gap-1">
                            {isSelected ? (
                                <textarea
                                    value={field.name}
                                    onChange={(e) => onChange(idx, { ...field, name: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })}
                                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                                    onClick={(e) => e.stopPropagation()}
                                    autoComplete="off"
                                    spellCheck="false"
                                    data-lpignore="true"
                                    data-1p-ignore="true"
                                    rows={1}
                                    ref={(el) => {
                                        if (!el) return;
                                        el.style.height = 'auto';
                                        el.style.height = el.scrollHeight + 'px';
                                    }}
                                    placeholder="Field name"
                                    className={`text-sm font-medium rounded flex-1 min-w-0 resize-none overflow-hidden ${isDuplicateName || isEmptyName ? 'border-red-400' : 'border-gray-300'}`}
                                />
                            ) : (
                                <span className="text-sm font-medium text-gray-800 flex-1 min-w-0 truncate">
                                    {field.name || <span className="text-gray-400 italic">unnamed</span>}
                                </span>
                            )}
                            <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={(e) => { e.stopPropagation(); onSelect(isSelected ? null : idx); }}
                                className={`flex items-center justify-center flex-shrink-0 px-1.5 py-1 rounded border cursor-pointer ${
                                    isSelected
                                        ? 'border-blue-400 text-blue-600 bg-blue-50 hover:bg-blue-100'
                                        : 'border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                                    <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.263a1.75 1.75 0 0 0 0-2.474ZM4.75 13.5c-.69 0-1.25-.56-1.25-1.25V4.75c0-.69.56-1.25 1.25-1.25H7a.75.75 0 0 0 0-1.5H4.75A2.75 2.75 0 0 0 2 4.75v7.5A2.75 2.75 0 0 0 4.75 15h7.5A2.75 2.75 0 0 0 15 12.25V10a.75.75 0 0 0-1.5 0v2.25c0 .69-.56 1.25-1.25 1.25h-7.5Z" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={(e) => { e.stopPropagation(); onDelete(idx); }}
                                className="flex items-center justify-center flex-shrink-0 px-1.5 py-1 rounded border border-gray-200 text-red-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                                    <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5A.75.75 0 0 1 9.95 6Z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        {isEmptyName && (
                            <p className="text-red-500 text-xs mt-0.5">Name is required</p>
                        )}
                        {isDuplicateName && (
                            <p className="text-red-500 text-xs mt-0.5">Name must be unique</p>
                        )}

                        {isSelected && (
                            <div className="flex flex-wrap gap-2 text-xs mt-2">
                                <label className="flex-1 min-w-[6rem]">
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
                                <label className="w-12">
                                    Size
                                    <NumericInput
                                        min={1}
                                        value={field.font_size}
                                        onChange={(v) => onChange(idx, { ...field, font_size: v })}
                                        onClick={(e) => e.stopPropagation()}
                                        className="mt-1 block w-full text-xs border-gray-300 rounded"
                                    />
                                </label>
                                <label className="w-16">
                                    Color
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
                                <label className="w-12">
                                    X (mm)
                                    <NumericInput
                                        min={0}
                                        value={field.x_coordinate}
                                        onChange={(v) => onChange(idx, { ...field, x_coordinate: v })}
                                        onClick={(e) => e.stopPropagation()}
                                        className="mt-1 block w-full text-xs border-gray-300 rounded"
                                    />
                                </label>
                                <label className="w-12">
                                    Y (mm)
                                    <NumericInput
                                        min={0}
                                        value={field.y_coordinate}
                                        onChange={(v) => onChange(idx, { ...field, y_coordinate: v })}
                                        onClick={(e) => e.stopPropagation()}
                                        className="mt-1 block w-full text-xs border-gray-300 rounded"
                                    />
                                </label>
                                <label className="w-12">
                                    W (mm)
                                    <NumericInput
                                        min={1}
                                        value={field.width}
                                        onChange={(v) => onChange(idx, { ...field, width: v })}
                                        onClick={(e) => e.stopPropagation()}
                                        className="mt-1 block w-full text-xs border-gray-300 rounded"
                                    />
                                </label>
                                <label className="w-12">
                                    H (mm)
                                    <NumericInput
                                        min={1}
                                        value={field.height}
                                        onChange={(v) => onChange(idx, { ...field, height: v })}
                                        onClick={(e) => e.stopPropagation()}
                                        className="mt-1 block w-full text-xs border-gray-300 rounded"
                                    />
                                </label>

                                {fieldErrors.map((k) => (
                                    <div key={k} className="w-full">
                                        <InputError message={errors[k]} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </aside>
    );
}
