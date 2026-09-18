/*
 * Chart series colours for the Atussa theme. UI colours are CSS tokens in src/index.css.
 *
 * The raw brand greens are too dark / too grey to identify a series, so the series
 * colours are chart-strength steps of the brand hues, validated for the white card
 * surface: current + secondary are colour-blind separable (CVD ΔE 9.9, normal-vision
 * ΔE 20.1) and clear 3:1 contrast; each "previous" step is a lighter step of the same
 * hue (ordinal: previous period -> current) and is also drawn dashed.
 */
export const chart = {
  current: "#357A43", // series 1 — Atussa forest at chart strength
  previous: "#85B476", // series 1, previous period
  secondary: "#C0851F", // series 2 — ochre
  secondaryPrevious: "#DCAB53", // series 2, previous period
  grid: "#E7E9E0", // hairline gridlines
};
