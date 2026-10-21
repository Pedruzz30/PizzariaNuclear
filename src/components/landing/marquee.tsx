import { Icon } from "@/components/icon";

const highlights = [
  "21 SABORES",
  "4 TAMANHOS",
  "INTEIRA OU MEIO A MEIO",
  "BORDAS E ADICIONAIS",
];

export function Marquee() {
  return (
    <div className="marquee theme-dark" aria-hidden="true">
      <div className="marquee__track">
        {[0, 1].map((copy) => (
          <span className="marquee__group" key={copy}>
            {highlights.map((highlight) => (
              <span className="marquee__item" key={highlight}>
                <span>{highlight}</span>
                <Icon name="spark" />
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
