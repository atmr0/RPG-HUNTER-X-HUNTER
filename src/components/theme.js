// Visual theme constants for components
export const COLORS = {
  cellBackground: "transparent", 
  cellBorder: "transparent", 
  background: "#ffffff",
  primary: "#1f6feb",
  secondary: "#ff8c42",
  accent: "#8b5cf6",
  text: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  surface: "#f9fafb",
  success: "#16a34a",
  danger: "#ef4444",
};

export const ATTRIBUTE_COLORS = {
  FORCA_FISICA: "red",
  AGILIDADE: "yellow",
  INTELECTO: "green",
  ASTUCIA: "blue",
  FORCA_VONTADE: "purple",
  PORTE: "grey",
  text: "#111827",
  focus: "#000000",
};

export const SIZES = {
  attrCircle: "72px",
  attrCircleInner: "64px",
  fieldPadding: "8px",
  gap: "8px",
};
export const RADIUS = {
  small: "4px",
  medium: "8px",
  circle: "50%",
};

export const INPUT = {
  borderWidth: "1px",
  borderColor: COLORS.border,
  padding: "6px 8px",
};

export const BUTTON = {
  bg: COLORS.primary,
  color: "#fff",
  padding: "6px 10px",
  radius: RADIUS.small,
};

export const FONT = {
  base: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
  small: "12px",
  normal: "14px",
  large: "18px",
};

// Apply theme as CSS custom properties on :root so components can use var(--...)
export function applyTheme(root = document.documentElement) {
  function set(prefix, obj) {
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (v && typeof v === "object") {
        set(`${prefix}-${k}`, v);
      } else {
        root.style.setProperty(`--${prefix}-${k}`, String(v));
      }
    }
  }

  set("color", COLORS);
  set("size", SIZES);
  set("radius", RADIUS);
  set("input", INPUT);
  set("button", BUTTON);
  set("font", FONT);
}

export default { COLORS, SIZES, FONT, applyTheme };
