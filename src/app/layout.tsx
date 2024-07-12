import { Inter as FontSans } from "next/font/google"
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { CurrencyProvider } from "@/components/CurrencyContext";

const APP_NAME = "Journi";
const APP_DEFAULT_TITLE = "Journi";
const APP_TITLE_TEMPLATE = "Journi";
const APP_DESCRIPTION = "Plan, Share, Explore. Together.";

const defaultUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: "http://localhost:3000";

const fontSans = FontSans({
	subsets: ["latin"],
	variable: "--font-sans",
})

export const metadata = {
	metadataBase: new URL(defaultUrl),
	applicationName: APP_NAME,
	title: {
		default: APP_DEFAULT_TITLE,
		template: APP_TITLE_TEMPLATE,
	},
	description: APP_DESCRIPTION,
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: APP_DEFAULT_TITLE,
		// startUpImage: [],
	},
	formatDetection: {
		telephone: false,
	},
	openGraph: {
		type: "website",
		siteName: APP_NAME,
		title: {
			default: APP_DEFAULT_TITLE,
			template: APP_TITLE_TEMPLATE,
		},
		description: APP_DESCRIPTION,
	},
	twitter: {
		card: "summary",
		title: {
			default: APP_DEFAULT_TITLE,
			template: APP_TITLE_TEMPLATE,
		},
		description: APP_DESCRIPTION,
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="dark">
			<body className={cn("min-h-screen bg-background font-sans antialiased text-foreground", fontSans.variable)}>
				<main className="min-h-screen flex flex-col items-center">
					<CurrencyProvider>
						{children}
					</CurrencyProvider>
				</main>
				<Toaster />
			</body>
		</html >
	);
}
