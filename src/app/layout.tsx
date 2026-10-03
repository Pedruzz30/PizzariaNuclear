import type { Metadata } from "next";
import localFont from "next/font/local";
import "../../css/main.css";
import "../../css/header.css";
import "../../css/hero.css";
import "../../css/products.css";
import "../../css/sections.css";
import "../../css/cart.css";
import "../../css/footer.css";
import "../../css/responsive.css";
import "./globals.css";

const anton = localFont({
  src: "../../node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2",
  variable: "--font-anton",
  display: "swap",
});
const inter = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2",
      weight: "400",
    },
    {
      path: "../../node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2",
      weight: "500",
    },
    {
      path: "../../node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2",
      weight: "600",
    },
    {
      path: "../../node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2",
      weight: "700",
    },
  ],
  variable: "--font-inter",
  display: "swap",
});
export const metadata: Metadata = {
  title: "Pizzaria Nuclear — Sabor que explode",
  description:
    "Pizza artesanal, ingredientes marcantes e muito sabor. Conheça o cardápio da Pizzaria Nuclear.",
  icons: { icon: "/assets/logo/nuclear-seal.svg" },
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${anton.variable} ${inter.variable}`}>
      <body>
        <a href="#conteudo" className="skip-link">
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
