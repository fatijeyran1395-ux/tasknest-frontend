import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "TaskNest | مدیریت وظایف",
  description: "سیستم مدیریت وظایف حرفه‌ای",
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
      <html lang="fa" dir="rtl">
      <head>
        <link
            href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
            rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gray-950">
      <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
            },
          }}
      />
      {children}
      </body>
      </html>
  );
}