import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ThermoStat — climate performance based on reality, not promises",
  description:
    "ThermoStat turns a company's achieved emissions trajectory into a single temperature score versus IPCC pathways. Descriptive, based on reality not pledges.",
};

// Applies the saved theme before paint so there's no flash of the wrong theme.
const themeScript = `try{if(localStorage.getItem('ts-theme')==='light'){document.documentElement.classList.add('light')}}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
