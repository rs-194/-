/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,json}'],
  theme: {
    extend: {
      colors: {
        abyss: '#120609',
        blood: '#7f1d1d',
        ember: '#c2410c',
        parchment: '#f5ead2',
        brass: '#d6a84f',
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        body: ['Inter', 'Segoe UI', 'Microsoft YaHei', 'sans-serif'],
      },
      boxShadow: {
        infernal: '0 24px 80px rgba(20, 3, 6, 0.55)',
        seal: '0 0 0 1px rgba(214, 168, 79, 0.25), 0 18px 48px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
}
