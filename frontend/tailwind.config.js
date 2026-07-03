/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    future: {
        // hover: classes compile to @media (hover: hover) - taps on touch screens
        // no longer leave hover styles stuck
        hoverOnlyWhenSupported: true,
    },
    theme: {
        screens: {
            sm: "340px", // mobile
            md: "768px", // tablet
            xl: "1025px", // desktop
        },
        extend: {
            colors: {
                "almost-black": "#000000",
                "almost-white": "#FFFFFF",
                "dark-purple": "#7E60BF",
                "perfect-purple": "#B692C2",
                "perfect-pink": "#f4dfee",
                "baby-blue": "#B1CEF0",
                "pale-beige": "#f4edf4",
            },
            fontFamily: {
                // 3.3: the distorted "Kharkiv Tone" display font is replaced by the new
                // brand heading font everywhere `font-kharkiv` is already used
                kharkiv: ["Fraunces", "serif"],
                montserratMedium: ["Montserrat-Medium", "sans-serif"],
                montserratRegular: ["Montserrat-Regular", "sans-serif"],
            },
            fontSize: {
                h_num: "96pt",
                h_s_num: "72pt",
                h1: "50pt",
                h2: "36pt",
                h2s: "30pt",
                h3: "24pt",
                h4: "22pt",
                h5: "18pt",
                pxll: "16pt",
                pxl: "15pt",
                pl: "12pt",
                pd: "11pt",
                ps: "10pt",
                psm: "8pt",

                "relative-xlh1": "7vw",
                "relative-xlh2": "6vw",
                "relative-h1": "5vw", // Relative header 1 size
                "relative-h2": "3.75vw", // Relative header 2 size
                "relative-h3xl": "3.2vw", // Relative header 2 size
                "relative-h3": "2.5vw", // Relative header 3 size
                "relative-h4": "2vw", // Relative header 3 size
                "relative-pxl": "1.5625vw", // Relative extra large paragraph size
                "relative-pl": "1.25vw", // Relative large paragraph size
                "relative-ps": "1vw", // Relative standard paragraph size
                "relative-psm": "0.75vw", // Relative small paragraph size

                // Additional mobile sizes
                "xs-h1": "32pt", // Mobile Header 1 size
                "xs-h2": "24pt", // Mobile Header 2 size
                "xs-h3": "20pt", // Mobile Header 3 size
                "xs-pxl": "14pt", // Mobile paragraph size
                "xs-pl": "12pt", // Mobile paragraph large size
                "xs-ps": "10pt", // Mobile paragraph standard size
            },
            spacing: {
                "relative-ssm": "calc(0.5rem + 0.5vw)", // For `md` screens
                "relative-sm": "calc(1rem + 1vw)", // For `md` screens
                "relative-bmd": "-0.2vw", // For `md` screens
                "relative-md": "calc(2rem + 2vw)", // For `md` screens
                "relative-smlg": "calc(3rem + 3vw)", // For `md` screens
                "relative-lg": "calc(4rem + 4vw)", // For `md` screens
                "relative-blg": "calc(5rem + 55vw)", // For `md` screens
                "relative-elg": "calc(8rem + 8vw)", // For `md` screens
                "relative-xlg": "calc(10rem + 10vw)", // For `md` screens
                "relative-1/2": "calc(50% + 1vw)", // For `md` screens

                // Additional mobile spacing
                "xs-relative-sm": "1rem", // Small spacing for mobile
                "xs-relative-md": "2rem", // Medium spacing for mobile
                "xs-relative-lg": "4rem", // Large spacing for mobile
            },
        },
    },
    plugins: [],
};
