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
    <div className="place-staff-form">
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
      <input value={draft.productName} onChange={(event) => onChange({ ...draft, productName: event.target.value })} placeholder="Produto avulso" />
      <input value={draft.buyerName} onChange={(event) => onChange({ ...draft, buyerName: event.target.value })} placeholder="Cliente" />
      <input type="number" min={1} value={draft.quantity} onChange={(event) => onChange({ ...draft, quantity: event.target.value })} placeholder="Qtd" />
      <input type="number" min={0} value={draft.unitAmount} onChange={(event) => onChange({ ...draft, unitAmount: event.target.value })} placeholder="Valor R$" />
      <button type="button" onClick={onSubmit} disabled={busy || (!draft.productId && !draft.productName.trim())}>
        Registrar venda
      </button>
    </div>
  );
}
