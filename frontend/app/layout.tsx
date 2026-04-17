import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AskUni — AI-Powered University Assistant",
  description:
    "Get instant, cited answers about admissions, courses, fees, and campus policies at Anurag University using advanced Retrieval-Augmented Generation AI.",
  keywords: ["university", "AI", "admissions", "Anurag University", "RAG", "chatbot"],
  openGraph: {
    title: "AskUni — AI-Powered University Assistant",
    description: "Get instant AI answers about Anurag University.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
