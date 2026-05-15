import { useMemo, useState } from "react";
import type { PlacePosProduct } from "../../lib/types";
import { WorkspaceEmptyState, WorkspaceList, WorkspaceRow } from "./PlaceWorkspaceUi";

type PlaceCanteenStockModuleProps = {
  countLabel: (count: number, singular: string, plural: string) => string;
  formatMoneyFromCents: (amountCents: number) => string;
  products: PlacePosProduct[];
  showHeader?: boolean;
  onOpenProducts?: () => void;
};

export function PlaceCanteenStockModule({
  countLabel,
  formatMoneyFromCents,
  products,
  showHeader = false,
  onOpenProducts,
}: PlaceCanteenStockModuleProps) {
  const [query, setQuery] = useState("");
  const lowStockProducts = products.filter((product) => product.stockQuantity <= 3);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredProducts = useMemo(() => {
    if (!normalizedQuery) return products;
    return products.filter((product) =>
      [product.name, product.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [normalizedQuery, products]);

  return (
    <WorkspaceList>
      {showHeader ? (
        <div className="place-booking-head">
          <strong>Estoque</strong>
          <span>{countLabel(lowStockProducts.length, "item baixo", "itens baixos")}</span>
        </div>
      ) : null}

      <div className="canteen-stock-summary">
        <div>
          <strong>{lowStockProducts.length}</strong>
          <span>{countLabel(lowStockProducts.length, "item precisa", "itens precisam")} de reposicao</span>
        </div>
        <label>
          Buscar no estoque
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome ou categoria" />
        </label>
        {onOpenProducts ? (
          <button type="button" onClick={onOpenProducts}>
            Produtos
          </button>
        ) : null}
      </div>

      {lowStockProducts.length ? (
        <section className="canteen-stock-section">
          <strong>Estoque baixo</strong>
          {lowStockProducts.map((product) => (
            <WorkspaceRow
              key={`canteen-low-stock:${product.id}`}
              className={product.stockQuantity <= 0 ? "blocked" : "due"}
              title={product.name}
              detail={`${product.category || "Produto"} | ${formatMoneyFromCents(product.priceCents)}`}
            >
              <small>{product.stockQuantity <= 0 ? "zerado" : `${product.stockQuantity} em estoque`} | revisar reposicao</small>
            </WorkspaceRow>
          ))}
        </section>
      ) : null}

      <section className="canteen-stock-section">
        <strong>Todos os produtos</strong>
        {filteredProducts.map((product) => (
          <WorkspaceRow
            key={`canteen-stock:${product.id}`}
            className={product.stockQuantity <= 0 ? "blocked" : product.stockQuantity <= 3 ? "due" : ""}
            title={product.name}
            detail={`${product.category || "Produto"} | ${formatMoneyFromCents(product.priceCents)}`}
          >
            <small>{product.stockQuantity} em estoque{product.stockQuantity <= 3 ? " | revisar reposicao" : ""}</small>
          </WorkspaceRow>
        ))}
      </section>

      {!products.length ? (
        <WorkspaceEmptyState
          title="Cadastre produtos para controlar estoque."
          detail="A venda rapida tambem funciona como item avulso, mas estoque so aparece para produtos cadastrados."
          action={
            onOpenProducts ? (
              <button type="button" onClick={onOpenProducts}>
                Cadastrar produto
              </button>
            ) : null
          }
        />
      ) : !filteredProducts.length ? (
        <WorkspaceEmptyState title="Nenhum produto encontrado." detail="Ajuste a busca para voltar a lista completa." />
      ) : null}
    </WorkspaceList>
  );
}
