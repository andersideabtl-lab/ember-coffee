import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ember Coffee",
  description: "Premium coffee experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
