"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="section" id="conteudo">
      <h1 className="section__title">Cardápio indisponível</h1>
      <p>Não foi possível carregar o cardápio. Tente novamente em instantes.</p>
      <button className="button button--primary" onClick={reset}>
        Tentar novamente
      </button>
    </main>
  );
}
