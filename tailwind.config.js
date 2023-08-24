/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./renderer/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./renderer/src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./renderer/src/helpers/**/*.{js,ts,jsx,tsx,mdx}"    
  ],  
  theme: {
    extend: {
      colors: {
        "imperial-red": "#FB3640",
        "royal-blue": "#0A2463",
        "dark-grey": "#605F5E",
        "cerulean": "#247BA0",
        "platinum": "#E2E2E2",
      }         
    },
  },
  plugins: [],
}

