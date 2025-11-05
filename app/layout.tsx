import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/store/Providers";

export const metadata: Metadata = {
  title: "Data Table Manager",
  description:
    "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
