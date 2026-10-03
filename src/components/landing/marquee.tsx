export function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      {" "}
      <div className="marquee__track">
        {" "}
        <span className="marquee__group">
          {" "}
          <span>MASSA DE 48 HORAS</span> <span>★</span>{" "}
          <span>FORNO A LENHA</span> <span>★</span>{" "}
          <span>INGREDIENTES REAIS</span> <span>★</span>{" "}
          <span>ENTREGA EM 40 MIN</span> <span>★</span>{" "}
        </span>{" "}
        <span className="marquee__group">
          {" "}
          <span>MASSA DE 48 HORAS</span> <span>★</span>{" "}
          <span>FORNO A LENHA</span> <span>★</span>{" "}
          <span>INGREDIENTES REAIS</span> <span>★</span>{" "}
          <span>ENTREGA EM 40 MIN</span> <span>★</span>{" "}
        </span>{" "}
      </div>{" "}
    </div>
  );
}
