import { useMemo, useState } from "react";
import type { PlacePosProduct } from "../../lib/types";
import { EntityActionRow, WorkspaceEmptyState, WorkspaceList } from "./PlaceWorkspaceUi";

type PlaceCanteenProductsModuleProps = {
  formatMoneyFromCents: (amountCents: number) => string;
  products: PlacePosProduct[];
};

export function PlaceCanteenProductsModule({ formatMoneyFromCents, products }: PlaceCanteenProductsModuleProps) {
  const [query, setQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "empty">("all");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        [product.name, product.category]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && product.stockQuantity > 0 && product.stockQuantity <= 3) ||
        (stockFilter === "empty" && product.stockQuantity <= 0);
      return matchesQuery && matchesStock;
    });
  }, [normalizedQuery, products, stockFilter]);

  return (
    <WorkspaceList>
      <div className="canteen-list-toolbar">
        <label>
          Buscar produto
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome ou categoria" />
        </label>
        <div className="segmented-control" aria-label="Filtro de estoque dos produtos">
          <button type="button" className={stockFilter === "all" ? "active" : ""} onClick={() => setStockFilter("all")}>
            Todos
          </button>
          <button type="button" className={stockFilter === "low" ? "active" : ""} onClick={() => setStockFilter("low")}>
            Baixo
          </button>
          <button type="button" className={stockFilter === "empty" ? "active" : ""} onClick={() => setStockFilter("empty")}>
            Zerado
          </button>
        </div>
      </div>
      {filteredProducts.map((product) => (
        <EntityActionRow
          key={`canteen-product:${product.id}`}
          className={product.stockQuantity <= 0 ? "blocked" : product.stockQuantity <= 3 ? "due" : ""}
          context={product.category || "Produto"}
          detail={`${product.stockQuantity} em estoque`}
          status={product.stockQuantity <= 0 ? "Zerado" : product.stockQuantity <= 3 ? "Estoque baixo" : "Disponivel"}
          title={product.name}
          primaryAction={<span>{formatMoneyFromCents(product.priceCents)}</span>}
        />
      ))}
      {!products.length ? (
        <WorkspaceEmptyState title="Nenhum produto cadastrado." detail="Cadastre produtos em uma lista unica; a venda rapida usa essa tabela." />
      ) : !filteredProducts.length ? (
        <WorkspaceEmptyState title="Nenhum produto nesse filtro." detail="Ajuste a busca ou limpe o filtro de estoque." />
      ) : null}
    </WorkspaceList>
  );
}
