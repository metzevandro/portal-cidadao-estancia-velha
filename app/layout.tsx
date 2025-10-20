import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.scss";
import "design-system-zeroz/dist/index.esm.css";
import "design-system-zeroz/src/scss/tokens/tokens.scss";
import Layout from "./_layout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portal do Cidadão - Estância Velha",
  description:
    "O Portal do Cidadão de Estância Velha é uma plataforma para registrar e acompanhar solicitações da comunidade, como buracos nas ruas, iluminação pública, limpeza urbana, focos de dengue e outras demandas do município. Um canal direto entre o cidadão e a Prefeitura para melhorar a cidade juntos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className={`${inter.variable}`}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
