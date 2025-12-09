/** @type {import('tailwindcss').Config} */
const { fontFamily } = require("tailwindcss/defaultTheme")

module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    {
      pattern: /gap-(2|4|6|8|10|12|16|20|24)/, // This will include gap-2, gap-4, etc.
    },
    // Add layout pattern classes to safelist
    {
      pattern: /max-w-(boxed|wide|narrow)/,
    },
    // Add color classes for MetricFeature components
    {
      pattern: /bg-(blue|cyan|purple|green|red|yellow|indigo|pink|gray|slate)-(50|100|200|300|400|500|600|700|800|900)/,
    },
    // Add text color classes
    {
      pattern: /text-(blue|cyan|purple|green|red|yellow|indigo|pink|gray|slate)-(50|100|200|300|400|500|600|700|800|900)/,
    },
    // Add animation classes for navbar
    'scale-x-0',
    'scale-x-100',
    'group-hover:scale-x-100',
    'duration-150',
    'duration-200',
    'duration-300',
    'duration-500',
    'duration-700',
    'duration-1000',
    'delay-75',
    'delay-100',
    'delay-150',
    'delay-200',
    'delay-300',
    'hover:-translate-y-1',
    'hover:scale-110',
    '-translate-y-0.5',
    'scale-105',
    'isolate',
  ],
  theme: {
  	extend: {
  		maxWidth: {
  			boxed: '1200px',
  			wide: '1600px',
  			narrow: '800px',
  			container: 'var(--container-width, 1200px)'
  		},
  		padding: {
  			container: 'var(--content-padding, 2rem)'
  		},
  		fontSize: {
  			xs: [
  				'var(--font-size-xs, 0.75rem)',
  				{
  					lineHeight: '1rem'
  				}
  			],
  			sm: [
  				'var(--font-size-sm, 0.875rem)',
  				{
  					lineHeight: '1.25rem'
  				}
  			],
  			base: [
  				'var(--font-size-base, 1rem)',
  				{
  					lineHeight: '1.5rem'
  				}
  			],
  			lg: [
  				'var(--font-size-lg, 1.125rem)',
  				{
  					lineHeight: '1.75rem'
  				}
  			],
  			xl: [
  				'var(--font-size-xl, 1.25rem)',
  				{
  					lineHeight: '1.75rem'
  				}
  			],
  			'2xl': [
  				'var(--font-size-2xl, 1.5rem)',
  				{
  					lineHeight: '2rem'
  				}
  			],
  			'3xl': [
  				'var(--font-size-3xl, 1.875rem)',
  				{
  					lineHeight: '2.25rem'
  				}
  			],
  			'4xl': [
  				'var(--font-size-4xl, 2.25rem)',
  				{
  					lineHeight: '2.5rem'
  				}
  			],
  			'5xl': [
  				'var(--font-size-5xl, 3rem)',
  				{
  					lineHeight: '1'
  				}
  			],
  			'6xl': [
  				'var(--font-size-6xl, 3.75rem)',
  				{
  					lineHeight: '1'
  				}
  			],
  			'7xl': [
  				'var(--font-size-7xl, 4.5rem)',
  				{
  					lineHeight: '1'
  				}
  			],
  			'8xl': [
  				'var(--font-size-8xl, 6rem)',
  				{
  					lineHeight: '1'
  				}
  			],
  			'9xl': [
  				'var(--font-size-9xl, 8rem)',
  				{
  					lineHeight: '1'
  				}
  			]
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-sans)',
                    ...fontFamily.sans
                ],
  			heading: [
  				'var(--font-heading)',
                    ...fontFamily.sans
                ]
  		},
  		boxShadow: {
  			sm: 'var(--shadow-sm)',
  			DEFAULT: 'var(--shadow)',
  			md: 'var(--shadow-md)',
  			lg: 'var(--shadow-lg)',
  			xl: 'var(--shadow-xl)',
  			'2xl': 'var(--shadow-2xl)',
  			inner: 'var(--shadow-inner)'
  		},
  		transitionDuration: {
  			DEFAULT: 'var(--transition-duration)'
  		},
  		transitionTimingFunction: {
  			DEFAULT: 'var(--transition-timing-function)'
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}
