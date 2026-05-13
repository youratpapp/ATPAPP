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
    <details className="progressive-form">
      <summary>Novo produto</summary>
      <div className="progressive-form-primary">
        <label>
          Produto
          <input value={draft.name} onChange={(event) => onChange({ ...draft, name: event.target.value })} placeholder="Agua, bola, grip" />
        </label>
        <label>
          Preco
          <input type="number" min={0} value={draft.price} onChange={(event) => onChange({ ...draft, price: event.target.value })} placeholder="R$" />
        </label>
        <label>
          Estoque inicial
          <input type="number" min={0} value={draft.stock} onChange={(event) => onChange({ ...draft, stock: event.target.value })} placeholder="Qtd" />
        </label>
        <button type="button" className="primary" onClick={onSubmit} disabled={busy || !draft.name.trim()}>
          Criar produto
        </button>
      </div>
      <div className="progressive-form-secondary">
        <label className="progressive-form-wide">
          Categoria
          <input value={draft.category} onChange={(event) => onChange({ ...draft, category: event.target.value })} placeholder="Bebida, acessorio, alimentacao" />
        </label>
      </div>
    </details>
  );
}
