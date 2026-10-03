import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Marquee } from "@/components/landing/marquee";
import { Story } from "@/components/landing/story";
import { Footer } from "@/components/landing/footer";
import { CartProvider } from "@/components/cart/cart-provider";
import { Menu } from "@/components/menu/menu";
import { getCatalog } from "@/server/catalog";

export const dynamic = "force-dynamic";
export default async function Home() {
  const catalog = await getCatalog();
  return (
    <CartProvider products={catalog.products}>
      <Header />
      <main id="conteudo">
        <Hero
          featured={catalog.products.filter((product) => product.featured)}
        />
        <Marquee />
        {catalog.source === "demo" ? (
          <p className="environment-note" role="status">
            Cardápio de demonstração — pedidos e pagamentos online ainda não
            estão habilitados.
          </p>
        ) : null}
        <Menu categories={catalog.categories} products={catalog.products} />
        <Story />
      </main>
      <Footer />
    </CartProvider>
  );
}
