// // module.exports = {
// //   theme: {
// //     screens: {
// //       'custom': '650px',
// //       'xs': '480px',
// //     }
// //   }
// // }

// const defaultTheme = require('tailwindcss/defaultTheme')

// module.exports = {
//   theme: {
//     screens: {
//       'xs': '480px',
//       ...defaultTheme.screens,
//       'custom': '650px',
//     }
//   }
// }


// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",      // Add this if using app directory
    "./pages/**/*.{js,jsx,ts,tsx}",    // Add this if using pages directory
    "./components/**/*.{js,jsx,ts,tsx}",// Add this 
    "./src/app/(protected)/**/*.{js,jsx,ts,tsx}", // Your protected routes
  ],
  safelist: [
    'md:translate-y-12',
  ],// Update the content path as per your project
  theme: {
    extend: {
      fontFamily: {
        borel: ['"Borel"', 'cursive', '"Poppins"'], // Define the font family
      },
      screens: {
        'xs': '360px', // Add custom breakpoint for 360px
      },
    },
  },

};

// 'xm': '390px',
// 'xl': '450px',
// "ls": ""