import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BulkMail Sender - Email Automation",
  description: "Send personalized emails from Excel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}