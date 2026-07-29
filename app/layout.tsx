import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").host;
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);

  return {
    metadataBase: base,
    title: {
      default: "RecallCode — Make algorithms stick",
      template: "%s · RecallCode",
    },
    description:
      "Master data structures and algorithms with active recall, spaced repetition, and an AI tutor.",
    openGraph: {
      title: "RecallCode — Make algorithms stick",
      description:
        "Solve once. Recall for good. A smarter way to master coding patterns.",
      type: "website",
      images: [
        {
          url: new URL("/og.png", base).toString(),
          width: 1792,
          height: 922,
          alt: "RecallCode — Solve once. Recall for good.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "RecallCode — Make algorithms stick",
      description: "Solve once. Recall for good.",
      images: [new URL("/og.png", base).toString()],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('recallcode-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}",
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
