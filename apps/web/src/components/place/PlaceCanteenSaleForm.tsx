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
  products: PlacePosProduct[];
  onChange: (draft: PlacePosSaleDraft) => void;
  onSubmit: () => void;
};

export function PlaceCanteenSaleForm({ busy, draft, products, onChange, onSubmit }: PlaceCanteenSaleFormProps) {
  return (
    <div className="progressive-form progressive-form-static">
      <div className="progressive-form-primary">
        <label>
          Produto
          <select
            value={draft.productId}
            onChange={(event) => {
              const product = products.find((item) => item.id === event.target.value);
              onChange({
                ...draft,
                productId: event.target.value,
                productName: product?.name || "",
                unitAmount: product ? String(Math.round(product.priceCents / 100)) : draft.unitAmount,
              });
            }}
          >
            <option value="">Venda avulsa</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.stockQuantity})
              </option>
            ))}
          </select>
        </label>
        <label>
          Item avulso
          <input value={draft.productName} onChange={(event) => onChange({ ...draft, productName: event.target.value })} placeholder="Produto" />
        </label>
        <label>
          Qtd
          <input type="number" min={1} value={draft.quantity} onChange={(event) => onChange({ ...draft, quantity: event.target.value })} placeholder="Qtd" />
        </label>
        <label>
          Valor
          <input type="number" min={0} value={draft.unitAmount} onChange={(event) => onChange({ ...draft, unitAmount: event.target.value })} placeholder="R$" />
        </label>
        <button type="button" className="primary" onClick={onSubmit} disabled={busy || (!draft.productId && !draft.productName.trim())}>
          Registrar venda
        </button>
      </div>
      <details className="progressive-form-nested">
        <summary>Detalhes da venda</summary>
        <div className="progressive-form-secondary">
          <label className="progressive-form-wide">
            Cliente
            <input value={draft.buyerName} onChange={(event) => onChange({ ...draft, buyerName: event.target.value })} placeholder="Nome do cliente, se necessario" />
          </label>
        </div>
      </details>
    </div>
  );
}
