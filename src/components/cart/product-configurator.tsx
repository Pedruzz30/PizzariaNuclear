"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  MAX_NOTES_LENGTH,
  getProductChoices,
  type CartSelection,
} from "@/lib/cart";
import { formatPrice, type Catalog, type Product } from "@/lib/catalog-schema";

export function ProductConfigurator({
  catalog,
  product,
  onAdd,
  onClose,
}: {
  catalog: Catalog;
  product: Product;
  onAdd: (selection: CartSelection) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [sizeId, setSizeId] = useState<string | null>(null);
  const [optionIds, setOptionIds] = useState<string[]>([]);
  const [halfAndHalf, setHalfAndHalf] = useState(false);
  const [notes, setNotes] = useState("");
  const { sizes, groups } = getProductChoices(catalog, product.id);
  const flavorGroup = groups.find((group) => group.kind === "flavor");
  const regularGroups = groups.filter((group) => group.kind !== "flavor");
  const flavorOptionId = flavorGroup?.options.find((option) =>
    optionIds.includes(option.id),
  )?.id;
  const selectedSize = sizes.find((size) => size.id === sizeId);
  const selectedOptions = groups
    .flatMap((group) => group.options)
    .filter((option) => optionIds.includes(option.id));
  const unitPrice =
    (selectedSize?.price_cents ?? product.base_price_cents) +
    selectedOptions.reduce(
      (sum, option) => sum + option.additional_price_cents,
      0,
    );
  const canAdd =
    product.active &&
    product.available &&
    (!sizes.length || sizeId !== null) &&
    (!flavorGroup ||
      (halfAndHalf ? Boolean(flavorOptionId) : !flavorOptionId)) &&
    groups.every((group) => {
      const count = group.options.filter((option) =>
        optionIds.includes(option.id),
      ).length;
      return count >= group.min_selections && count <= group.max_selections;
    });

  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);

  function toggleOption(optionId: string, groupId: string) {
    const group = groups.find((item) => item.id === groupId);
    if (!group) return;
    setOptionIds((current) => {
      if (current.includes(optionId))
        return current.filter((id) => id !== optionId);
      const inGroup = group.options.filter((option) =>
        current.includes(option.id),
      );
      if (inGroup.length >= group.max_selections) {
        if (group.max_selections === 1)
          return [
            ...current.filter(
              (id) => !group.options.some((option) => option.id === id),
            ),
            optionId,
          ];
        return current;
      }
      return [...current, optionId];
    });
  }

  function selectFlavor(optionId: string) {
    if (!flavorGroup) return;
    setOptionIds((current) => [
      ...current.filter(
        (id) => !flavorGroup.options.some((option) => option.id === id),
      ),
      ...(optionId ? [optionId] : []),
    ]);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canAdd) return;
    onAdd({ productId: product.id, sizeId, optionIds, notes: notes.trim() });
    dialog.current?.close();
  }

  return (
    <dialog
      ref={dialog}
      className="product-dialog"
      aria-labelledby="product-dialog-title"
      onClose={onClose}
    >
      <form onSubmit={submit} className="product-dialog__form">
        <header className="product-dialog__header">
          <div>
            <span className="product-dialog__eyebrow">
              Personalize seu pedido
            </span>
            <h2 id="product-dialog-title">{product.name}</h2>
          </div>
          <button
            type="button"
            className="product-dialog__close"
            aria-label="Fechar personalização"
            onClick={() => dialog.current?.close()}
          >
            ✕
          </button>
        </header>
        <p className="product-dialog__description">{product.description}</p>
        <div className="product-dialog__choices">
          {sizes.length ? (
            <fieldset className="product-dialog__group">
              <legend>Tamanho</legend>
              <p>Escolha uma opção.</p>
              {sizes.map((size) => (
                <label className="product-dialog__option" key={size.id}>
                  <input
                    type="radio"
                    name="product-size"
                    checked={sizeId === size.id}
                    onChange={() => setSizeId(size.id)}
                  />
                  <span>{size.name}</span>
                  <strong>{formatPrice(size.price_cents)}</strong>
                </label>
              ))}
            </fieldset>
          ) : (
            <p className="product-dialog__standard">
              Tamanho padrão · {formatPrice(product.base_price_cents)}
            </p>
          )}
          {flavorGroup ? (
            <fieldset className="product-dialog__group">
              <legend>Sabores</legend>
              <p>
                Inteira ou meio a meio pelo mesmo preço do tamanho escolhido.
              </p>
              <label className="product-dialog__option">
                <input
                  type="radio"
                  name="flavor-mode"
                  checked={!halfAndHalf}
                  onChange={() => {
                    setHalfAndHalf(false);
                    selectFlavor("");
                  }}
                />
                <span>Inteira — {product.name}</span>
              </label>
              <label className="product-dialog__option">
                <input
                  type="radio"
                  name="flavor-mode"
                  checked={halfAndHalf}
                  onChange={() => setHalfAndHalf(true)}
                />
                <span>Meio a meio</span>
              </label>
              {halfAndHalf ? (
                <label
                  className="product-dialog__select"
                  htmlFor="second-flavor"
                >
                  Segundo sabor
                  <select
                    id="second-flavor"
                    value={flavorOptionId ?? ""}
                    onChange={(event) => selectFlavor(event.target.value)}
                    required
                  >
                    <option value="">Escolha o segundo sabor</option>
                    {flavorGroup.options.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </fieldset>
          ) : null}
          {regularGroups.map((group) => (
            <fieldset className="product-dialog__group" key={group.id}>
              <legend>{group.name}</legend>
              <p>
                {group.min_selections > 0
                  ? `Escolha de ${group.min_selections} a ${group.max_selections}.`
                  : `Opcional · até ${group.max_selections}.`}
              </p>
              {group.options.map((option) => (
                <label className="product-dialog__option" key={option.id}>
                  <input
                    type="checkbox"
                    checked={optionIds.includes(option.id)}
                    onChange={() => toggleOption(option.id, group.id)}
                  />
                  <span>{option.name}</span>
                  <strong>
                    {option.additional_price_cents === 0
                      ? "Sem acréscimo"
                      : `+ ${formatPrice(option.additional_price_cents)}`}
                  </strong>
                </label>
              ))}
            </fieldset>
          ))}
          <label className="product-dialog__notes" htmlFor="product-notes">
            Observações para o preparo
            <textarea
              id="product-notes"
              rows={3}
              maxLength={MAX_NOTES_LENGTH}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Ex.: sem cebola"
            />
            <small>
              {notes.length}/{MAX_NOTES_LENGTH}
            </small>
          </label>
        </div>
        <footer className="product-dialog__footer">
          <span>
            <small>Valor estimado</small>
            <strong>{formatPrice(unitPrice)}</strong>
          </span>
          <button
            className="button button--primary"
            type="submit"
            disabled={!canAdd}
          >
            Adicionar ao carrinho
          </button>
        </footer>
      </form>
    </dialog>
  );
}
