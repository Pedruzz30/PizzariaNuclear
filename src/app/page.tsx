import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Marquee } from "@/components/landing/marquee";
import { Story } from "@/components/landing/story";
import { Footer } from "@/components/landing/footer";
import { CartProvider } from "@/components/cart/cart-provider";
import { Menu } from "@/components/menu/menu";
import { getCatalog } from "@/server/catalog";
import { getCheckoutAvailability } from "@/server/checkout-availability";

export const dynamic = "force-dynamic";
export default async function Home() {
  const [catalog, checkoutAvailability] = await Promise.all([
    getCatalog(),
    getCheckoutAvailability(),
  ]);
  return (
    <CartProvider catalog={catalog} checkoutAvailability={checkoutAvailability}>
      <Header />
      <main id="conteudo">
        <Hero
          featured={catalog.products.filter((product) => product.featured)}
          sizes={catalog.sizes}
        />
        <Marquee />
        <p className="environment-note" role="status">
          Cardápio em homologação — pagamento online disponível somente após
          validar o ambiente de teste.
        </p>
        <Menu
          categories={catalog.categories}
          products={catalog.products}
          sizes={catalog.sizes}
        />
        <Story catalog={catalog} />
      </main>
      <Footer contact={catalog.storeContact} />
    </CartProvider>
  );
}
