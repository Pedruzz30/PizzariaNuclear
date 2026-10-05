const highlights = [
  "21 SABORES",
  "4 TAMANHOS",
  "INTEIRA OU MEIO A MEIO",
  "BORDAS E ADICIONAIS",
];

export function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {[0, 1].map((copy) => (
          <span className="marquee__group" key={copy}>
            {highlights.map((highlight) => (
              <span key={highlight}>
                {highlight} <span>★</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
