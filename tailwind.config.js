/** @type {import('tailwindcss').Config} */

/**
 * Comprehensive Tailwind Configuration with Figma Design Tokens
 * Generated on: 2025-10-01T02:52:37.845Z
 *
 * This configuration includes a comprehensive design system based on Figma tokens
 * with semantic color naming, complete typography scale, and utility classes.
 *
 * Features:
 * - Full color palette with semantic naming (bg/fg variants)
 * - Complete typography system (headings, body, display)
 * - Standard spacing scale
 * - Border radius and shadow utilities
 * - Brand and utility colors
 */

module.exports = {
  "content": [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/design-system/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/stories/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  "theme": {
    "extend": {
      "colors": {

"border": "hsl(var(--border))",
"input": "hsl(var(--input))",
"ring": "hsl(var(--ring))",
"background": "hsl(var(--background))",
"foreground": "hsl(var(--foreground))",
"primary": {
  "DEFAULT": "hsl(var(--primary))",
  "foreground": "hsl(var(--primary-foreground))"
},
"secondary": {
  "DEFAULT": "hsl(var(--secondary))",
  "foreground": "hsl(var(--secondary-foreground))"
},
"destructive": {
  "DEFAULT": "hsl(var(--destructive))",
  "foreground": "hsl(var(--destructive-foreground))"
},
"muted": {
  "DEFAULT": "hsl(var(--muted))",
  "foreground": "hsl(var(--muted-foreground))"
},
"accent": {
  "DEFAULT": "hsl(var(--accent))",
  "foreground": "hsl(var(--accent-foreground))"
},
"popover": {
  "DEFAULT": "hsl(var(--popover))",
  "foreground": "hsl(var(--popover-foreground))"
},
"card": {
  "DEFAULT": "hsl(var(--card))",
  "foreground": "hsl(var(--card-foreground))"
},

        "gray": {
          "25": "#fafafa",
          "50": "#f1f1f1",
          "100": "#e1e1e1",
          "200": "#d4d4d4",
          "300": "#bcbcbc",
          "400": "#a4a4a4",
          "500": "#8b8b8b",
          "600": "#676767",
          "700": "#5f5f5f",
          "800": "#424242",
          "900": "#323232",
          "1000": "#181818"
        },
        "cream": {
          "50": "#f4f0eb",
          "100": "#e8e0d7",
          "200": "#dbd3cb",
          "300": "#c2bbb4",
          "400": "#a9a39d",
          "500": "#8f8a85",
          "600": "#6a6662",
          "700": "#625e5b",
          "800": "#44423f",
          "900": "#343230"
        },
        "blue": {
          "50": "#e5f3f8",
          "100": "#c9e6f0",
          "200": "#b9dfea",
          "300": "#8bc9de",
          "400": "#6ab0ca",
          "500": "#4d93af",
          "600": "#376c89",
          "700": "#306385",
          "800": "#234658",
          "900": "#1b3644"
        },
        "green": {
          "50": "#e3f5eb",
          "100": "#cbedda",
          "200": "#a9e2b3",
          "300": "#76ce98",
          "400": "#52b784",
          "500": "#319d6d",
          "600": "#247450",
          "700": "#0e6c52",
          "800": "#174b34",
          "900": "#123928"
        },
        "yellow": {
          "50": "#faf1ce",
          "100": "#f3e197",
          "200": "#eed366",
          "300": "#d7ba5a",
          "400": "#c1a14e",
          "500": "#a9863c",
          "600": "#7f6139",
          "700": "#755a34",
          "800": "#523f25",
          "900": "#3f301c"
        },
        "red": {
          "50": "#fbeee9",
          "100": "#f7e1d8",
          "200": "#f0ceb7",
          "300": "#e7b08c",
          "400": "#e09361",
          "500": "#bf6640",
          "600": "#9a5435",
          "700": "#904b2c",
          "800": "#623725",
          "900": "#4a2b1d"
        },
        "purple": {
          "50": "#f3eff6",
          "100": "#e9e3ee",
          "200": "#ddcfeb",
          "300": "#cfb7dd",
          "400": "#b39cc5",
          "500": "#a489bb",
          "600": "#765c8b",
          "700": "#6f5782",
          "800": "#4c3c5a",
          "900": "#3a2e45"
        },
        "saturated-red": {
          "50": "#fcedeb",
          "100": "#f8dad6",
          "200": "#f5cbc5",
          "300": "#ecada5",
          "400": "#e18e85",
          "500": "#d36d64",
          "600": "#b33f3b",
          "700": "#b4272c",
          "800": "#712c28",
          "900": "#552320"
        },
        "brand": {
          "carby-green": "#6bd9a1",
          "logo-primary": "#222324",
          "logo-secondary": "#6e7071",
          "logo-purple": "#baa3bf",
          "logo-mint": "#a3e1c2",
          "logo-green": "#24a06d",
          "logo-orange": "#e15c18",
          "logo-yellow": "#ebc627",
          "logo-blue": "#58b3ca"
        },
        // Flattened semantic colors - aliases to core tokens (commented with source)
        // Neutral backgrounds
        "bg-neutral-base": "#ffffff", // white
        "bg-neutral-min": "#fafafa", // gray.25
        "bg-neutral-subtle": "#f1f1f1", // gray.50
        "bg-neutral-low": "#e1e1e1", // gray.100
        "bg-neutral-low-accented": "#d4d4d4", // gray.200
        "bg-neutral-medium": "#d4d4d4", // gray.200
        "bg-neutral-inverse-base": "#181818", // gray.1000
        "bg-neutral-inverse-low": "#676767", // gray.600

        // Attention backgrounds (yellow scale)
        "bg-attention-subtle": "#faf1ce", // yellow.50
        "bg-attention-low": "#f3e197", // yellow.100
        "bg-attention-low-accented": "#eed366", // yellow.200
        "bg-attention-medium": "#eed366", // yellow.200
        "bg-attention-high": "#7f6139", // yellow.600
        "bg-attention-high-accented": "#523f25", // yellow.800

        // Alert backgrounds (saturated-red scale)
        "bg-alert-subtle": "#fcedeb", // saturated-red.50
        "bg-alert-low": "#f8dad6", // saturated-red.100
        "bg-alert-low-accented": "#f5cbc5", // saturated-red.200
        "bg-alert-medium": "#f5cbc5", // saturated-red.200
        "bg-alert-high": "#b33f3b", // saturated-red.600
        "bg-alert-high-accented": "#712c28", // saturated-red.800

        // Positive backgrounds (green scale)
        "bg-positive-subtle": "#e3f5eb", // green.50
        "bg-positive-low": "#cbedda", // green.100
        "bg-positive-low-accented": "#a9e2b3", // green.200
        "bg-positive-medium": "#a9e2b3", // green.200
        "bg-positive-strong": "#52b784", // green.400
        "bg-positive-high": "#247450", // green.600
        "bg-positive-high-accented": "#174b34", // green.800

        // Information backgrounds (blue scale)
        "bg-information-subtle": "#e5f3f8", // blue.50
        "bg-information-low": "#c9e6f0", // blue.100
        "bg-information-low-accented": "#b9dfea", // blue.200
        "bg-information-medium": "#b9dfea", // blue.200
        "bg-information-high": "#376c89", // blue.600
        "bg-information-high-accented": "#234658", // blue.800

        // Accent backgrounds (purple scale)
        "bg-accent-subtle": "#f3eff6", // purple.50
        "bg-accent-low": "#e9e3ee", // purple.100
        "bg-accent-low-accented": "#ddcfeb", // purple.200
        "bg-accent-medium": "#ddcfeb", // purple.200
        "bg-accent-high": "#765c8b", // purple.600
        "bg-accent-high-accented": "#4c3c5a", // purple.800

        // Neutral foregrounds (gray scale)
        "fg-neutral-primary": "#181818", // gray.1000
        "fg-neutral-secondary": "#424242", // gray.800
        "fg-neutral-softest": "#f1f1f1", // gray.50
        "fg-neutral-softer": "#e1e1e1", // gray.100
        "fg-neutral-soft": "#d4d4d4", // gray.200
        "fg-neutral-spot-readable": "#a4a4a4", // gray.400
        "fg-neutral-disabled": "#a4a4a4", // gray.400
        "fg-neutral-inverse-primary": "#ffffff", // white
        "fg-neutral-inverse-secondary": "#d4d4d4", // gray.200

        // Alert foregrounds
        "fg-alert-primary": "#712c28", // saturated-red.800
        "fg-alert-secondary": "#b33f3b", // saturated-red.600
        "fg-alert-inverse-primary": "#ffffff", // white
        "fg-alert-inverse-secondary": "#f8dad6", // saturated-red.100

        // Attention foregrounds
        "fg-attention-primary": "#523f25", // yellow.800
        "fg-attention-secondary": "#7f6139", // yellow.600

        // Positive foregrounds
        "fg-positive-primary": "#174b34", // green.800
        "fg-positive-secondary": "#247450", // green.600
        "fg-positive-spot-readable": "#52b784", // green.400
        "fg-positive-inverse-primary": "#ffffff", // white
        "fg-positive-inverse-secondary": "#cbedda", // green.100

        // Information foregrounds
        "fg-information-primary": "#234658", // blue.800
        "fg-information-secondary": "#376c89", // blue.600
        "fg-information-spot-readable": "#6ab0ca", // blue.400
        "fg-information-inverse-primary": "#ffffff", // white
        "fg-information-inverse-secondary": "#c9e6f0", // blue.100

        // Accent foregrounds
        "fg-accent-primary": "#4c3c5a", // purple.800
        "fg-accent-secondary": "#765c8b", // purple.600
        "fg-accent-spot-readable": "#b39cc5", // purple.400

        // Keep nested versions for reference/documentation
        "bg": {
          "neutral": {
            "base": "#ffffff",
            "min": "#fafafa",
            "subtle": "#f1f1f1",
            "low": "#e1e1e1",
            "low-accented": "#d4d4d4",
            "medium": "#d4d4d4",
            "inverse-base": "#181818",
            "inverse-low": "#676767"
          },
          "attention": {
            "subtle": "#faf1ce",
            "low": "#f3e197",
            "low-accented": "#eed366",
            "medium": "#eed366",
            "high": "#7f6139",
            "high-accented": "#523f25"
          },
          "alert": {
            "subtle": "#fcedeb",
            "low": "#f8dad6",
            "low-accented": "#f5cbc5",
            "medium": "#f5cbc5",
            "high": "#b33f3b",
            "high-accented": "#712c28"
          },
          "positive": {
            "subtle": "#e3f5eb",
            "low": "#cbedda",
            "low-accented": "#a9e2b3",
            "medium": "#a9e2b3",
            "strong": "#52b784",
            "high": "#247450",
            "high-accented": "#174b34"
          },
          "information": {
            "subtle": "#e5f3f8",
            "low": "#c9e6f0",
            "low-accented": "#b9dfea",
            "medium": "#b9dfea",
            "high": "#376c89",
            "high-accented": "#234658"
          },
          "accent": {
            "subtle": "#f3eff6",
            "low": "#e9e3ee",
            "low-accented": "#ddcfeb",
            "medium": "#ddcfeb",
            "high": "#765c8b",
            "high-accented": "#4c3c5a"
          }
        },
        "fg": {
          "neutral": {
            "primary": "#181818",
            "secondary": "#424242",
            "softest": "#f1f1f1",
            "softer": "#e1e1e1",
            "soft": "#d4d4d4",
            "spot-readable": "#a4a4a4",
            "disabled": "#a4a4a4",
            "inverse-primary": "#ffffff",
            "inverse-secondary": "#d4d4d4"
          },
          "alert": {
            "primary": "#712c28",
            "secondary": "#b33f3b",
            "inverse-primary": "#ffffff",
            "inverse-secondary": "#f8dad6"
          },
          "attention": {
            "primary": "#523f25",
            "secondary": "#7f6139"
          },
          "positive": {
            "primary": "#174b34",
            "secondary": "#247450",
            "spot-readable": "#52b784",
            "inverse-primary": "#ffffff",
            "inverse-secondary": "#cbedda"
          },
          "information": {
            "primary": "#234658",
            "secondary": "#376c89",
            "spot-readable": "#6ab0ca",
            "inverse-primary": "#ffffff",
            "inverse-secondary": "#c9e6f0"
          },
          "accent": {
            "primary": "#4c3c5a",
            "secondary": "#765c8b",
            "spot-readable": "#b39cc5"
          }
        },
        "utility": {
          "a11y-blue": "#4477ff",
          "carby-green": "#6bd9a1"
        },
        "white": "#ffffff",
        "black": "#000000"
      },
      "fontFamily": {
        "sans": [
          "Inter",
          "system-ui",
          "-apple-system",
          "sans-serif"
        ]
      },
      "fontSize": {
        "2xs": [
          "10px",
          {
            "lineHeight": "16px",
            "fontWeight": "400"
          }
        ],
        "2xs-bold": [
          "10px",
          {
            "lineHeight": "16px",
            "fontWeight": "600"
          }
        ],
        "xs": [
          "12px",
          {
            "lineHeight": "16px",
            "fontWeight": "400"
          }
        ],
        "xs-bold": [
          "12px",
          {
            "lineHeight": "16px",
            "fontWeight": "600"
          }
        ],
        "sm": [
          "14px",
          {
            "lineHeight": "20px",
            "fontWeight": "400"
          }
        ],
        "sm-bold": [
          "14px",
          {
            "lineHeight": "20px",
            "fontWeight": "600"
          }
        ],
        "base": [
          "16px",
          {
            "lineHeight": "24px",
            "fontWeight": "400"
          }
        ],
        "base-bold": [
          "16px",
          {
            "lineHeight": "24px",
            "fontWeight": "600"
          }
        ],
        "lg": [
          "20px",
          {
            "lineHeight": "28px",
            "fontWeight": "400"
          }
        ],
        "lg-bold": [
          "20px",
          {
            "lineHeight": "28px",
            "fontWeight": "600"
          }
        ],
        "xl": [
          "24px",
          {
            "lineHeight": "36px",
            "fontWeight": "400"
          }
        ],
        "xl-bold": [
          "24px",
          {
            "lineHeight": "36px",
            "fontWeight": "600"
          }
        ],
        "heading-xs": [
          "14px",
          {
            "lineHeight": "20px",
            "fontWeight": "600"
          }
        ],
        "heading-sm": [
          "16px",
          {
            "lineHeight": "24px",
            "fontWeight": "600"
          }
        ],
        "heading-md": [
          "20px",
          {
            "lineHeight": "28px",
            "fontWeight": "600"
          }
        ],
        "heading-lg": [
          "24px",
          {
            "lineHeight": "36px",
            "fontWeight": "600"
          }
        ],
        "heading-xl": [
          "28px",
          {
            "lineHeight": "40px",
            "fontWeight": "600"
          }
        ],
        "heading-2xl": [
          "32px",
          {
            "lineHeight": "44px",
            "fontWeight": "600"
          }
        ],
        "heading-3xl": [
          "40px",
          {
            "lineHeight": "56px",
            "fontWeight": "600"
          }
        ],
        "heading-4xl": [
          "48px",
          {
            "lineHeight": "64px",
            "fontWeight": "600"
          }
        ],
        "heading-5xl": [
          "60px",
          {
            "lineHeight": "80px",
            "fontWeight": "600"
          }
        ],
        "display-sm": [
          "28px",
          {
            "lineHeight": "40px",
            "fontWeight": "600"
          }
        ],
        "display-md": [
          "32px",
          {
            "lineHeight": "44px",
            "fontWeight": "600"
          }
        ],
        "display-lg": [
          "40px",
          {
            "lineHeight": "56px",
            "fontWeight": "600"
          }
        ],
        "display-xl": [
          "48px",
          {
            "lineHeight": "64px",
            "fontWeight": "600"
          }
        ],
        "display-2xl": [
          "60px",
          {
            "lineHeight": "80px",
            "fontWeight": "600"
          }
        ]
      },
      "fontWeight": {
        "normal": "400",
        "medium": "500",
        "semibold": "600",
        "bold": "700"
      },
      "lineHeight": {
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "7": "28px",
        "8": "32px",
        "9": "36px",
        "10": "40px",
        "11": "44px",
        "14": "56px",
        "16": "64px",
        "20": "80px",
        "24": "96px"
      },
      "spacing": {
        "0": "0px",
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "7": "28px",
        "8": "32px",
        "9": "36px",
        "10": "40px",
        "11": "44px",
        "12": "48px",
        "14": "56px",
        "16": "64px",
        "20": "80px",
        "24": "96px",
        "32": "128px",
        "40": "160px",
        "48": "192px",
        "56": "224px",
        "64": "256px"
      },
      "borderRadius": {
        "none": "0",
        "sm": "2px",
        "DEFAULT": "4px",
        "md": "6px",
        "lg": "8px",
        "xl": "12px",
        "2xl": "16px",
        "3xl": "24px",
        "full": "9999px"
      },
      "boxShadow": {
        "xs": "0px 1px 2px rgba(0, 0, 0, 0.05)",
        "sm": "0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)",
        "DEFAULT": "0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "md": "0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "lg": "0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "xl": "0px 25px 50px -12px rgba(0, 0, 0, 0.25)",
        "2xl": "0px 35px 60px -15px rgba(0, 0, 0, 0.3)",
        "inner": "inset 0px 2px 4px rgba(0, 0, 0, 0.06)",
        "none": "none"
      }
    }
  },
  "plugins": []
}
