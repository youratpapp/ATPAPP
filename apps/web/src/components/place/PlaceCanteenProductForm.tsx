export type PlacePosProductDraft = {
  category: string;
  name: string;
  price: string;
  stock: string;
};

type PlaceCanteenProductFormProps = {
  busy: boolean;
  draft: PlacePosProductDraft;
  onChange: (draft: PlacePosProductDraft) => void;
  onSubmit: () => void;
};

export function PlaceCanteenProductForm({ busy, draft, onChange, onSubmit }: PlaceCanteenProductFormProps) {
  return (
    <div className="place-staff-form">
      <input value={draft.name} onChange={(event) => onChange({ ...draft, name: event.target.value })} placeholder="Produto" />
      <input value={draft.category} onChange={(event) => onChange({ ...draft, category: event.target.value })} placeholder="Categoria" />
      <input type="number" min={0} value={draft.price} onChange={(event) => onChange({ ...draft, price: event.target.value })} placeholder="Preco R$" />
      <input type="number" min={0} value={draft.stock} onChange={(event) => onChange({ ...draft, stock: event.target.value })} placeholder="Estoque" />
      <button type="button" onClick={onSubmit} disabled={busy || !draft.name.trim()}>
        Criar produto
      </button>
    </div>
  );
}
