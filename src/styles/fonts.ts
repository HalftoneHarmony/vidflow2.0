/**
 * 🎸 Heavy Metal Typography System
 * 
 * Oswald: Headlines - Bold, condensed, commanding presence
 * Inter: Body text - Clean, highly readable
 */

import { Oswald, Inter } from 'next/font/google';

// Headline Font - Bold & Commanding
export const oswald = Oswald({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-oswald',
    display: 'swap',
});

// Body Font - Clean & Readable
export const inter = Inter({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-inter',
    display: 'swap',
});

// Combined font variables for className
export const fontVariables = `${oswald.variable} ${inter.variable}`;
