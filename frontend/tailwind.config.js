/** @type {import('tailwindcss').Config} */
import formsPlugin from '@tailwindcss/forms';
import containerQueriesPlugin from '@tailwindcss/container-queries';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "secondary": "#006c49",
        "primary-container": "#0052cc",
        "tertiary": "#603b00",
        "on-primary-fixed-variant": "#0040a2",
        "surface-tint": "#0c56d0",
        "on-surface": "#141b2b",
        "on-error-container": "#93000a",
        "on-primary-fixed": "#001848",
        "on-tertiary-container": "#ffc988",
        "surface-container-high": "#e1e8fd",
        "inverse-surface": "#293040",
        "on-secondary-fixed-variant": "#005236",
        "secondary-container": "#6cf8bb",
        "tertiary-fixed-dim": "#ffb95f",
        "inverse-on-surface": "#edf0ff",
        "on-error": "#ffffff",
        "on-tertiary-fixed-variant": "#653e00",
        "surface-container-highest": "#dce2f7",
        "on-secondary-container": "#00714d",
        "on-tertiary-fixed": "#2a1700",
        "primary-fixed-dim": "#b2c5ff",
        "outline-variant": "#c3c6d6",
        "background": "#f9f9ff",
        "primary-fixed": "#dae2ff",
        "inverse-primary": "#b2c5ff",
        "surface-container": "#e9edff",
        "secondary-fixed-dim": "#4edea3",
        "on-background": "#141b2b",
        "surface-container-lowest": "#ffffff",
        "surface-dim": "#d3daef",
        "error": "#ba1a1a",
        "surface": "#f9f9ff",
        "surface-bright": "#f9f9ff",
        "tertiary-fixed": "#ffddb8",
        "surface-variant": "#dce2f7",
        "on-secondary": "#ffffff",
        "on-primary": "#ffffff",
        "primary": "#003d9b",
        "tertiary-container": "#805000",
        "on-primary-container": "#c4d2ff",
        "on-secondary-fixed": "#002113",
        "surface-container-low": "#f1f3ff",
        "on-surface-variant": "#434654",
        "secondary-fixed": "#6ffbbe",
        "on-tertiary": "#ffffff",
        "outline": "#737685",
        "error-container": "#ffdad6"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "base": "4px",
        "xl": "32px",
        "xs": "4px",
        "margin-mobile": "16px",
        "lg": "24px",
        "md": "16px",
        "container-max": "1280px",
        "gutter": "24px",
        "sm": "8px"
      },
      fontFamily: {
        "headline-lg-mobile": ["Geist", "sans-serif"],
        "label-md": ["Geist", "sans-serif"],
        "headline-lg": ["Geist", "sans-serif"],
        "headline-md": ["Geist", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "display-lg": ["Geist", "sans-serif"],
        "label-sm": ["Geist", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"]
      },
      fontSize: {
        "headline-lg-mobile": ["24px", {"lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
        "label-md": ["14px", {"lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "500"}],
        "headline-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "600"}],
        "headline-md": ["24px", {"lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
        "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}],
        "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "label-sm": ["12px", {"lineHeight": "16px", "letterSpacing": "0.02em", "fontWeight": "500"}],
        "body-sm": ["14px", {"lineHeight": "20px", "fontWeight": "400"}]
      }
    },
  },
  plugins: [
    formsPlugin,
    containerQueriesPlugin,
  ],
}
