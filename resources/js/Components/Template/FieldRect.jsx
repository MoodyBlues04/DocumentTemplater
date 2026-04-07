import { useEffect, useRef, useState } from 'react';
import {
    mmToPx,
    pxToMm,
    MIN_FIELD_SIZE_MM,
    PDF_SCALE,
} from '@/lib/pdfCoords';

const HANDLES = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'];

const HANDLE_BASE = 'absolute w-2 h-2 bg-white border border-blue-600 z-[2]';
const HANDLE_POS = {
    nw: '-left-1 -top-1 cursor-nwse-resize',
    n:  'left-1/2 -top-1 -ml-1 cursor-ns-resize',
    ne: '-right-1 -top-1 cursor-nesw-resize',
    w:  '-left-1 top-1/2 -mt-1 cursor-ew-resize',
    e:  '-right-1 top-1/2 -mt-1 cursor-ew-resize',
    sw: '-left-1 -bottom-1 cursor-nesw-resize',
    s:  'left-1/2 -bottom-1 -ml-1 cursor-ns-resize',
    se: '-right-1 -bottom-1 cursor-nwse-resize',
};

export default function FieldRect({ field, scale = PDF_SCALE, selected, onChange, onSelect }) {
    const x = mmToPx(field.x_coordinate, scale);
    const y = mmToPx(field.y_coordinate, scale);
    const w = mmToPx(field.width, scale);
    const h = mmToPx(field.height, scale);

    // Latest field/onChange/scale captured via refs so the drag handlers
    // installed on mousedown always read fresh values without re-binding listeners.
    const fieldRef = useRef(field);
    const onChangeRef = useRef(onChange);
    const scaleRef = useRef(scale);
    fieldRef.current = field;
    onChangeRef.current = onChange;
    scaleRef.current = scale;

    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (editing) inputRef.current?.focus();
    }, [editing]);

    const startInteraction = (mode) => (e) => {
        e.stopPropagation();
        e.preventDefault();
        onSelect?.();

        const start = {
            startX: e.clientX,
            startY: e.clientY,
            origX: x,
            origY: y,
            origW: w,
            origH: h,
        };

        function handleMove(ev) {
            const dx = ev.clientX - start.startX;
            const dy = ev.clientY - start.startY;
            const currentField = fieldRef.current;
            const currentOnChange = onChangeRef.current;
            const currentScale = scaleRef.current;
            const minPx = mmToPx(MIN_FIELD_SIZE_MM, currentScale);

            if (mode === 'drag') {
                const nx = Math.max(0, start.origX + dx);
                const ny = Math.max(0, start.origY + dy);
                currentOnChange({
                    ...currentField,
                    x_coordinate: pxToMm(nx, currentScale),
                    y_coordinate: pxToMm(ny, currentScale),
                });
                return;
            }

            let nx = start.origX;
            let ny = start.origY;
            let nw = start.origW;
            let nh = start.origH;

            if (mode.includes('e')) nw = Math.max(minPx, start.origW + dx);
            if (mode.includes('s')) nh = Math.max(minPx, start.origH + dy);
            if (mode.includes('w')) {
                const newW = Math.max(minPx, start.origW - dx);
                nx = start.origX + (start.origW - newW);
                nw = newW;
            }
            if (mode.includes('n')) {
                const newH = Math.max(minPx, start.origH - dy);
                ny = start.origY + (start.origH - newH);
                nh = newH;
            }

            currentOnChange({
                ...currentField,
                x_coordinate: pxToMm(Math.max(0, nx), currentScale),
                y_coordinate: pxToMm(Math.max(0, ny), currentScale),
                width: Math.max(1, pxToMm(nw, currentScale)),
                height: Math.max(1, pxToMm(nh, currentScale)),
            });
        }

        function handleUp() {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        }

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
    };

    const rectClass = [
        'absolute box-border select-none',
        selected
            ? 'border-2 border-solid border-blue-600 bg-blue-600/10'
            : 'border-[1.5px] border-dashed border-blue-600 bg-blue-600/5',
        editing ? 'cursor-text' : 'cursor-move',
    ].join(' ');

    return (
        <div
            onMouseDown={editing ? undefined : startInteraction('drag')}
            onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                onSelect?.();
                setEditing(true);
            }}
            className={rectClass}
            style={{ left: x, top: y, width: w, height: h }}
            title={field.name}
        >
            <span className="absolute -top-[18px] left-0 text-[11px] bg-blue-600 text-white px-1 py-px rounded-sm pointer-events-none">
                {field.name}
            </span>

            {editing ? (
                <textarea
                    ref={inputRef}
                    value={field.preview_text ?? ''}
                    onChange={(e) => {
                        const el = e.target;
                        el.style.height = 'auto';
                        el.style.height = el.scrollHeight + 'px';
                        onChange({
                            ...field,
                            preview_text: e.target.value,
                            height: Math.max(MIN_FIELD_SIZE_MM, pxToMm(el.scrollHeight + 8, scale)),
                        });
                    }}
                    onBlur={() => setEditing(false)}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') { e.preventDefault(); setEditing(false); }
                        e.stopPropagation();
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    rows={1}
                    className="absolute left-1 right-1 top-1/2 -translate-y-1/2 bg-transparent border-0 outline-none p-0 leading-[1.2] text-center resize-none overflow-hidden"
                    style={{
                        fontSize: field.font_size * scale,
                        color: field.font_color,
                        fontFamily: 'inherit',
                    }}
                />
            ) : field.preview_text ? (
                <span
                    className="absolute left-1 right-1 top-1/2 -translate-y-1/2 overflow-hidden whitespace-pre-wrap break-words leading-[1.2] text-center pointer-events-none"
                    style={{ fontSize: field.font_size * scale, color: field.font_color }}
                >
                    {field.preview_text}
                </span>
            ) : null}

            {selected && HANDLES.map((dir) => (
                <div
                    key={dir}
                    onMouseDown={startInteraction(dir)}
                    className={`${HANDLE_BASE} ${HANDLE_POS[dir]}`}
                />
            ))}
        </div>
    );
}
