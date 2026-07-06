/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom branding colors matching a trustworthy property app
        brand: {
          blue: '#1d4ed8',
          green: '#16a34a',
        }
      }
    },
  },
  plugins: [],
}
