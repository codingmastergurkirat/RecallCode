import type { Metadata } from "next";
import { Black_Ops_One, Oswald } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const blackOpsOne = Black_Ops_One({
  variable: "--font-black-ops-one",
  weight: "400",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
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
          width: 1748,
          height: 899,
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('recallcode-theme');document.documentElement.classList.toggle('dark',t!=='light')}catch(e){}",
          }}
        />
      </head>
      <body
        className={`${blackOpsOne.variable} ${oswald.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
