import Link from "next/link";
export default function NotFound() {
  return (
    <main className="section" id="conteudo">
      <h1 className="section__title">Página não encontrada</h1>
      <Link href="/" className="button button--primary">
        Voltar ao cardápio
      </Link>
    </main>
  );
}
