import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/store/Providers";

export const metadata: Metadata = {
  title: "Dynamic Data Table Manager",
  description:
    "Next.js + Redux Toolkit + MUI + CSV Import/Export + Inline Editing",
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
