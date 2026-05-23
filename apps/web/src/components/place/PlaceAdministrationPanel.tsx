type AdministrationChecklistItem = {
  detail: string;
  done: boolean;
  key: string;
  title: string;
  onOpen: () => void;
};

type PlaceAdministrationPanelProps = {
  activeClassCount: number;
  activeCourtCount: number;
  activeMembershipPlanCount: number;
  activeStaffCount: number;
  checklist: AdministrationChecklistItem[];
  enabledFeatures: string[];
  locationLabel: string;
  nextStep: { title: string; detail: string } | null;
  pendingInviteCount: number;
  planHint: string;
  planLabel: string;
  placeName: string;
  productCount: number;
  setupDoneCount: number;
  setupPercent: number;
  setupTotalCount: number;
  onOpenFinance: () => void;
  onOpenPublicData: () => void;
  onOpenPublicPage: () => void;
  onOpenRules: () => void;
  onOpenTeam: () => void;
};

export function PlaceAdministrationPanel({
  activeClassCount,
  activeCourtCount,
  activeMembershipPlanCount,
  activeStaffCount,
  checklist,
  enabledFeatures,
  locationLabel,
  nextStep,
  pendingInviteCount,
  planHint,
  planLabel,
  placeName,
  productCount,
  setupDoneCount,
  setupPercent,
  setupTotalCount,
  onOpenFinance,
  onOpenPublicData,
  onOpenPublicPage,
  onOpenRules,
  onOpenTeam,
}: PlaceAdministrationPanelProps) {
  const selectedItem = checklist.find((item) => !item.done) || checklist[0];

  return (
    <section className="administration-console" aria-label="Central administrativa do local">
      <header className="administration-console__hero">
        <div>
          <span>ADMINISTRACAO</span>
          <h1>Central administrativa</h1>
          <p>Estrutura, publicacao, equipe, plano e regras ficam fora da rotina diaria.</p>
        </div>
        <div className="administration-console__hero-actions">
          <button type="button" onClick={onOpenPublicData}>Editar dados publicos</button>
          <button className="primary" type="button" onClick={onOpenPublicPage}>Ver pagina publica</button>
        </div>
      </header>

      <div className="administration-console__metrics" aria-label="Resumo administrativo">
        <article>
          <span>IMPLANTACAO</span>
          <strong>{setupPercent}%</strong>
          <small>{setupDoneCount}/{setupTotalCount} itens prontos</small>
        </article>
        <article>
          <span>PLANO</span>
          <strong>{planLabel}</strong>
          <small>{enabledFeatures.slice(0, 2).join(" + ") || "operacao basica"}</small>
        </article>
        <article>
          <span>RECURSOS</span>
          <strong>{activeCourtCount}</strong>
          <small>quadras ativas</small>
        </article>
        <article>
          <span>EQUIPE</span>
          <strong>{activeStaffCount}</strong>
          <small>{pendingInviteCount} convite(s) pendente(s)</small>
        </article>
      </div>

      <div className="administration-console__body">
        <div className="administration-console__main">
          <div className="administration-console__section-head">
            <div>
              <strong>Checklist estrutural</strong>
              <span>{placeName} · {locationLabel || "local sem cidade definida"}</span>
            </div>
            <button type="button" onClick={onOpenRules}>Regras operacionais</button>
          </div>

          <div className="administration-console__table" role="table" aria-label="Itens administrativos">
            <div className="administration-console__row administration-console__row--head" role="row">
              <span>Area</span>
              <span>Status</span>
              <span>Descricao</span>
              <span>Acao</span>
            </div>
            {checklist.map((item) => (
              <button
                key={item.key}
                className={`administration-console__row ${item.done ? "is-done" : "is-pending"}`}
                type="button"
                onClick={item.onOpen}
                role="row"
              >
                <span>{item.title}</span>
                <span>{item.done ? "Pronto" : "Pendente"}</span>
                <span>{item.detail}</span>
                <span>Abrir</span>
              </button>
            ))}
          </div>

          <div className="administration-console__resource-grid">
            <article>
              <span>Academia</span>
              <strong>{activeClassCount} turmas</strong>
              <small>Aulas, turmas e alunos ficam no dominio Academia.</small>
            </article>
            <article>
              <span>Financeiro</span>
              <strong>{activeMembershipPlanCount} planos</strong>
              <small>Planos, pacotes e cobrancas ficam em Financeiro.</small>
            </article>
            <article>
              <span>Loja/POS</span>
              <strong>{productCount} produtos</strong>
              <small>Estoque e venda ficam no dominio Loja/POS.</small>
            </article>
          </div>
        </div>

        <aside className="administration-console__drawer" aria-label="Detalhe administrativo">
          <div className="administration-console__drawer-card">
            <span>PROXIMO PASSO</span>
            <strong>{nextStep?.title || selectedItem?.title || "Base operacional pronta"}</strong>
            <p>{nextStep?.detail || selectedItem?.detail || "Use esta central apenas quando precisar mudar estrutura, regras ou publicacao."}</p>
            {selectedItem ? <button className="primary" type="button" onClick={selectedItem.onOpen}>Abrir configuracao</button> : null}
          </div>
          <div className="administration-console__drawer-card">
            <span>PLANO E LIMITES</span>
            <strong>{planLabel}</strong>
            <p>{planHint}</p>
            <button type="button" onClick={onOpenFinance}>Planos e pacotes</button>
          </div>
          <div className="administration-console__drawer-card">
            <span>EQUIPE</span>
            <strong>{activeStaffCount} ativo(s)</strong>
            <p>Convites, papeis e acesso operacional ficam em Equipe, sem disputar espaco com a rotina.</p>
            <button type="button" onClick={onOpenTeam}>Abrir equipe</button>
          </div>
        </aside>
      </div>
    </section>
  );
}
