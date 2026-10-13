import "./globals.css";
import Providers from "./providers";
import Header from "@/components/Header";

export const metadata = {
  title: "Corner Shop",
  description: "A simple online shop",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <main className="container main">{children}</main>
          <footer className="footer">© {new Date().getFullYear()} Corner Shop</footer>
        </Providers>
      </body>
    </html>
  );
}
