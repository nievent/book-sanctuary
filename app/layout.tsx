import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Book Sanctuary - Tu refugio literario personal",
  description: "Organiza tu biblioteca, trackea tu progreso y descubre tu próxima gran lectura",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: '#fdfcfb',
              color: '#1c1917',
              border: '1px solid #e7e5e4',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />
      </body>
    </html>
  );
}