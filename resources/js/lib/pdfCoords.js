// Coordinate conversion between PDF storage units (mm) and canvas pixels.
//
// PDF.js viewports are sized in PDF user units (≈ points, 1pt = 1/72 inch)
// multiplied by the chosen `scale`. We render the PDF at PDF_SCALE so the
// canvas has predictable dimensions; conversion is therefore:
//
//   px = mm * MM_TO_PT * PDF_SCALE
//   mm = px / PDF_SCALE * PT_TO_MM
//
// Storage is integer mm — we round on write only. Render uses float px.

export const PDF_SCALE = 1.5;          // ~108 DPI; readable without blur
export const PT_TO_MM = 25.4 / 72;
export const MM_TO_PT = 72 / 25.4;

export const DEFAULT_FIELD_WIDTH_MM = 60;
export const DEFAULT_FIELD_HEIGHT_MM = 8;
export const MIN_FIELD_SIZE_MM = 2;

export function mmToPx(mm, scale = PDF_SCALE) {
    return mm * MM_TO_PT * scale;
}

export function pxToMm(px, scale = PDF_SCALE) {
    return Math.round((px / scale) * PT_TO_MM);
}
