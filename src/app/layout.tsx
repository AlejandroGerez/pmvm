import type { Metadata } from "next";
import {
	Poppins,
	Space_Grotesk,
	Manrope,
	Lexend,
} from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { Providers } from "./providers";

// const fontHeading = Inter({
// 	subsets: ["latin"],
// 	display: "swap",
// 	variable: "--font-heading",
// });

// const fontBody = Inter({
// 	subsets: ["latin"],
// 	display: "swap",
// 	variable: "--font-body",
// });

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "700"],
	variable: "--font-poppins",
});

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
	variable: "--font-space-grotesk",
});

const manrope = Manrope({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700", "800"],
	variable: "--font-manrope",
});

const lexend = Lexend({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
	variable: "--font-lexend",
});

// const bebasNeue = Bebas_Neue({
// 	subsets: ["latin"],
// 	weight: ["400"],
// 	variable: "--font-bebasNeue",
// });

export const metadata: Metadata = {
	title: "PMVM",
	description: "Pesar Menos Vivir Más",
	icons: {
		icon: "/favico.ico",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				{/* eslint-disable-next-line @next/next/no-page-custom-font */}
				<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=optional" />
			</head>
			<body
				className={cn(
					"antialiased",
					poppins.variable,
					spaceGrotesk.variable,
					manrope.variable,
					lexend.variable,
				)}
			>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return children;
// }
