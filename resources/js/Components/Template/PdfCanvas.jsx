import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { PDF_SCALE } from '@/lib/pdfCoords';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function PdfCanvas({ fileUrl, scale = PDF_SCALE, onCanvasClick, children }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
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

    const handleClick = (e) => {
        const rect = containerRef.current.getBoundingClientRect();
        const xPx = e.clientX - rect.left;
        const yPx = e.clientY - rect.top;
        onCanvasClick?.(xPx, yPx);
    };

    if (!fileUrl) {
        return (
            <div className="bg-gray-100 border rounded-md p-4 text-center text-gray-500">
                No PDF file available.
            </div>
        );
    }

    return (
        <div className="border rounded-md inline-block bg-white relative">
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
                style={{
                    width:  size.width  > 0 ? Math.max(size.width,  Math.round(size.width  * PDF_SCALE / scale)) : 0,
                    height: size.height > 0 ? Math.max(size.height, Math.round(size.height * PDF_SCALE / scale)) : 0,
                }}
            >
                <div
                    ref={containerRef}
                    className="relative mx-auto"
                    style={{
                        width: size.width,
                        height: size.height,
                    }}
                    onClick={handleClick}
                >
                    <canvas ref={canvasRef} className="block pointer-events-none" />
                    {children}
                </div>
            </div>
        </div>
    );
}
