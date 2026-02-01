/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Apple HIG Spacing Scale (8pt grid)
      spacing: {
        'hig-1': '4px',
        'hig-2': '8px',
        'hig-3': '12px',
        'hig-4': '16px',
        'hig-5': '20px',
        'hig-6': '24px',
        'hig-8': '32px',
        'hig-10': '40px',
        'hig-12': '48px',
        'hig-16': '64px',
      },
      // Apple HIG Typography Scale
      fontSize: {
        'large-title': ['26px', { lineHeight: '32px' }],
        'title-1': ['22px', { lineHeight: '26px' }],
        'title-2': ['17px', { lineHeight: '22px' }],
        'title-3': ['15px', { lineHeight: '20px' }],
        'headline': ['13px', { lineHeight: '16px', fontWeight: '700' }],
        'body-hig': ['13px', { lineHeight: '16px' }],
        'callout': ['12px', { lineHeight: '15px' }],
        'subheadline': ['11px', { lineHeight: '14px' }],
        'footnote': ['10px', { lineHeight: '13px' }],
        'caption': ['10px', { lineHeight: '13px' }],
      },
      // Apple HIG Border Radius
      borderRadius: {
        'hig-sm': '4px',
        'hig-md': '6px',
        'hig-lg': '10px',
        'hig-xl': '14px',
      },
      // Apple HIG Shadows
      boxShadow: {
        'hig-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'hig-md': '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)',
        'hig-lg': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        'hig-xl': '0 20px 25px rgba(0, 0, 0, 0.1), 0 8px 10px rgba(0, 0, 0, 0.04)',
        'hig-popover': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'hig-modal': '0 25px 50px rgba(0, 0, 0, 0.25)',
      },
      // Apple HIG Animation Durations
      transitionDuration: {
        'instant': '100ms',
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
        'slower': '400ms',
      },
      // Touch Target Sizes
      minHeight: {
        'touch': '44px',
        'touch-comfortable': '48px',
        'button-sm': '28px',
        'button-md': '36px',
        'button-lg': '44px',
      },
      minWidth: {
        'touch': '44px',
        'touch-comfortable': '48px',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            a: {
              color: 'var(--accent)',
              '&:hover': {
                color: 'var(--accent-hover)',
              },
            },
            'code::before': {
              content: '""'
            },
            'code::after': {
              content: '""'
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
