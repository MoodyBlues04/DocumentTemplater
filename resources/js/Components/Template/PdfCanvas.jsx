import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { PDF_SCALE, pxToMm } from '@/lib/pdfCoords';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const DRAG_THRESHOLD = 4;

export default function PdfCanvas({ fileUrl, scale = PDF_SCALE, onCanvasClick, onSizeChange, children }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const onSizeChangeRef = useRef(onSizeChange);
    onSizeChangeRef.current = onSizeChange;
    const dragRef = useRef({ moved: false });
    const [dragging, setDragging] = useState(false);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        let renderTask = null;

        async function render() {
            if (!fileUrl) {
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const pdf = await pdfjsLib.getDocument(fileUrl).promise;
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale });
                if (cancelled) return;

                const canvas = canvasRef.current;
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                setSize({ width: viewport.width, height: viewport.height });
                onSizeChangeRef.current?.(pxToMm(viewport.width, scale), pxToMm(viewport.height, scale));

                renderTask = page.render({ canvasContext: ctx, viewport });
                await renderTask.promise;
            } catch (err) {
                if (err?.name === 'RenderingCancelledException') return;
                console.error('Failed to render PDF', err);
                if (!cancelled) setError(err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        render();
        return () => {
            cancelled = true;
            if (renderTask) renderTask.cancel();
        };
    }, [fileUrl, scale]);

    const handleMouseDown = (e) => {
        if (e.button !== 0) return;
        dragRef.current = { moved: false };

        const startX = e.clientX;
        const startY = e.clientY;
        // Scroll only the nearest scrollable ancestor (the PDF container wrapper)
        const scrollEl = containerRef.current?.parentElement ?? null;
        const startScrollLeft = scrollEl ? scrollEl.scrollLeft : 0;
        const startScrollTop  = scrollEl ? scrollEl.scrollTop  : 0;

        const handleMove = (ev) => {
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;
            if (!dragRef.current.moved && Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD) {
                dragRef.current.moved = true;
                setDragging(true);
            }
            if (dragRef.current.moved && scrollEl) {
                scrollEl.scrollLeft = startScrollLeft - dx;
                scrollEl.scrollTop  = startScrollTop  - dy;
            }
        };

        const handleUp = () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            setDragging(false);
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
    };

    const handleClick = (e) => {
        if (dragRef.current.moved) return;
        const rect = containerRef.current.getBoundingClientRect();
        onCanvasClick?.(e.clientX - rect.left, e.clientY - rect.top);
    };

    if (!fileUrl) {
        return (
            <div className="bg-gray-100 border rounded-md p-4 text-center text-gray-500">
                No PDF file available.
            </div>
        );
    }

    return (
        <div className="border rounded-md bg-white relative mx-auto" style={{ width: 'fit-content' }}>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 z-10">
                    Loading PDF…
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center text-red-600 z-10 p-4 text-center text-sm">
                    Failed to render PDF: {error.message ?? String(error)}
                </div>
            )}
            <div
                ref={containerRef}
                className={`relative select-none ${dragging ? 'cursor-grabbing' : 'cursor-crosshair'}`}
                style={{ width: size.width, height: size.height }}
                onMouseDown={handleMouseDown}
                onClick={handleClick}
            >
                <canvas ref={canvasRef} className="block pointer-events-none" />
                {children}
            </div>
        </div>
    );
}
