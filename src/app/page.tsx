import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Marquee } from "@/components/landing/marquee";
import { Story } from "@/components/landing/story";
import { LandingEffects } from "@/components/landing/landing-effects";
import { Footer } from "@/components/landing/footer";
import { CartProvider } from "@/components/cart/cart-provider";
import { Menu } from "@/components/menu/menu";
import { getCatalog } from "@/server/catalog";
import { getCheckoutAvailability } from "@/server/checkout-availability";
import { getDeliveryZones } from "@/server/delivery-zones";

export const dynamic = "force-dynamic";
export default async function Home() {
  const [catalog, checkoutAvailability, deliveryZones] = await Promise.all([
    getCatalog(),
    getCheckoutAvailability(),
    getDeliveryZones(),
  ]);
  return (
    <CartProvider
      catalog={catalog}
      checkoutAvailability={checkoutAvailability}
      deliveryZones={deliveryZones}
    >
      <LandingEffects />
      <Header contact={catalog.storeContact} />
      <main id="conteudo">
        <Hero
          featured={catalog.products.filter((product) => product.featured)}
          sizes={catalog.sizes}
          contact={catalog.storeContact}
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
