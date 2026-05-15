import { useMemo, useState } from "react";
import type { PlacePosProduct } from "../../lib/types";

export type PlacePosSaleDraft = {
  buyerName: string;
  productId: string;
  productName: string;
  quantity: string;
  unitAmount: string;
};

type PlaceCanteenSaleFormProps = {
  busy: boolean;
  draft: PlacePosSaleDraft;
  formatMoneyFromCents: (amountCents: number) => string;
  products: PlacePosProduct[];
  onChange: (draft: PlacePosSaleDraft) => void;
  onSubmit: () => void;
};

export function PlaceCanteenSaleForm({ busy, draft, formatMoneyFromCents, products, onChange, onSubmit }: PlaceCanteenSaleFormProps) {
  const [productQuery, setProductQuery] = useState("");
  const selectedProduct = products.find((item) => item.id === draft.productId) || null;
  const quantity = Math.max(1, Math.floor(Number(draft.quantity || 1)));
  const unitAmountCents = Math.max(0, Math.round(Number(draft.unitAmount || 0) * 100));
  const totalAmountCents = unitAmountCents * quantity;
  const lowStockProducts = products.filter((product) => product.stockQuantity > 0 && product.stockQuantity <= 3);
  const normalizedQuery = productQuery.trim().toLowerCase();
  const filteredProducts = useMemo(() => {
    if (!normalizedQuery) return products;
    return products.filter((product) =>
      [product.name, product.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [normalizedQuery, products]);
  const stockBlocked = Boolean(selectedProduct && selectedProduct.stockQuantity < quantity);
  const canSubmit = Boolean(draft.productId || draft.productName.trim()) && !stockBlocked;

  const selectProduct = (product: PlacePosProduct) => {
    if (product.stockQuantity <= 0) return;
    onChange({
      ...draft,
      productId: product.id,
      productName: "",
      quantity: draft.quantity || "1",
      unitAmount: String(Math.round(product.priceCents / 100)),
    });
  };

  const clearProduct = () => {
    onChange({
      ...draft,
      productId: "",
      productName: "",
      unitAmount: draft.unitAmount || "0",
    });
  };

  return (
    <div className="canteen-sale-workspace">
      <section className="progressive-form progressive-form-static canteen-sale-form">
        <div className="canteen-sale-head">
          <div>
            <strong>Venda rapida</strong>
            <span>Escolha um produto cadastrado ou registre uma venda avulsa.</span>
          </div>
          <b>{formatMoneyFromCents(totalAmountCents)}</b>
        </div>

        <div className="canteen-product-search">
          <label>
            Buscar produto
            <input value={productQuery} onChange={(event) => setProductQuery(event.target.value)} placeholder="Agua, grip, bola..." />
          </label>
          <button type="button" className={!draft.productId ? "active" : ""} onClick={clearProduct}>
            Venda avulsa
          </button>
        </div>

        <div className="canteen-product-grid" aria-label="Produtos da cantina">
          {filteredProducts.map((product) => {
            const isSelected = product.id === draft.productId;
            const isUnavailable = product.stockQuantity <= 0;
            return (
              <button
                key={product.id}
                type="button"
                className={`canteen-product-pick${isSelected ? " active" : ""}${isUnavailable ? " unavailable" : ""}`}
                disabled={isUnavailable}
                onClick={() => selectProduct(product)}
              >
                <strong>{product.name}</strong>
                <span>{product.category || "Produto"}</span>
                <small>
                  {formatMoneyFromCents(product.priceCents)} | {isUnavailable ? "sem estoque" : `${product.stockQuantity} em estoque`}
                </small>
              </button>
            );
          })}
          {!filteredProducts.length ? <p className="subtle">Nenhum produto encontrado. Use venda avulsa ou cadastre o item em Produtos.</p> : null}
        </div>

        <div className="canteen-sale-fields">
          <label>
            Item
            <input
              value={draft.productId ? selectedProduct?.name || "" : draft.productName}
              onChange={(event) => onChange({ ...draft, productName: event.target.value })}
              placeholder="Produto avulso"
              disabled={Boolean(draft.productId)}
            />
          </label>
          <label>
            Qtd
            <input type="number" min={1} value={draft.quantity} onChange={(event) => onChange({ ...draft, quantity: event.target.value })} placeholder="Qtd" />
          </label>
          <label>
            Valor unitario
            <input type="number" min={0} value={draft.unitAmount} onChange={(event) => onChange({ ...draft, unitAmount: event.target.value })} placeholder="R$" />
          </label>
          <label>
            Cliente
            <input value={draft.buyerName} onChange={(event) => onChange({ ...draft, buyerName: event.target.value })} placeholder="Nome, se necessario" />
          </label>
          <button type="button" className="primary" onClick={onSubmit} disabled={busy || !canSubmit}>
            Registrar venda
          </button>
        </div>

        {selectedProduct ? (
          <p className={`canteen-sale-note${stockBlocked ? " danger" : ""}`}>
            {stockBlocked
              ? `Estoque insuficiente: ${selectedProduct.stockQuantity} disponivel.`
              : `${selectedProduct.name}: ${selectedProduct.stockQuantity} em estoque apos selecionar.`}
          </p>
        ) : null}
      </section>

      <aside className="canteen-sale-side">
        <strong>Atencao de estoque</strong>
        {lowStockProducts.length ? (
          <div className="canteen-low-stock-strip">
            {lowStockProducts.map((product) => (
              <span key={`low-stock:${product.id}`}>
                {product.name} <b>{product.stockQuantity}</b>
              </span>
            ))}
          </div>
        ) : (
          <small>Sem produtos em estoque baixo agora.</small>
        )}
      </aside>
    </div>
  );
}
