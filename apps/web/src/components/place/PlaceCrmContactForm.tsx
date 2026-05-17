export type PlaceCrmContactDraft = {
  email: string;
  interest: string;
  name: string;
  nextContactOn: string;
  notes: string;
  ownerLabel: string;
  phone: string;
  source: string;
};

type PlaceCrmContactFormProps = {
  busy: boolean;
  defaultOpen?: boolean;
  draft: PlaceCrmContactDraft;
  open?: boolean;
  ownerListId: string;
  ownerOptions: string[];
  onChange: (draft: PlaceCrmContactDraft) => void;
  onOpenChange?: (open: boolean) => void;
  onSubmit: () => void;
};

export function PlaceCrmContactForm({
  busy,
  defaultOpen = false,
  draft,
  open,
  ownerListId,
  ownerOptions,
  onChange,
  onOpenChange,
  onSubmit,
}: PlaceCrmContactFormProps) {
  const controlled = typeof open === "boolean";
  return (
    <details
      className="progressive-form"
      open={controlled ? open : defaultOpen}
      onToggle={(event) => onOpenChange?.((event.currentTarget as HTMLDetailsElement).open)}
    >
      <summary>Novo contato</summary>
      <div className="progressive-form-primary">
        <label>
          Nome
          <input value={draft.name} onChange={(event) => onChange({ ...draft, name: event.target.value })} placeholder="Nome do lead ou aluno" />
        </label>
        <label>
          Telefone
          <input value={draft.phone} onChange={(event) => onChange({ ...draft, phone: event.target.value })} placeholder="WhatsApp" />
        </label>
        <label>
          Interesse
          <input value={draft.interest} onChange={(event) => onChange({ ...draft, interest: event.target.value })} placeholder="Turma, plano ou aula" />
        </label>
        <button type="button" className="primary" onClick={onSubmit} disabled={busy || !draft.name.trim()}>
          Criar contato
        </button>
      </div>
      <div className="progressive-form-secondary">
        <label>
          Email
          <input value={draft.email} onChange={(event) => onChange({ ...draft, email: event.target.value })} placeholder="Email" />
        </label>
        <label>
          Origem
          <input value={draft.source} onChange={(event) => onChange({ ...draft, source: event.target.value })} placeholder="Instagram, indicacao, recepcao" />
        </label>
        <label>
          Proximo contato
          <input type="date" value={draft.nextContactOn} onChange={(event) => onChange({ ...draft, nextContactOn: event.target.value })} aria-label="Proximo contato" />
        </label>
        <label>
          Responsavel
          <input
            list={ownerListId}
            value={draft.ownerLabel}
            onChange={(event) => onChange({ ...draft, ownerLabel: event.target.value })}
            placeholder="Responsavel"
          />
        </label>
        <label className="progressive-form-wide">
          Notas
          <input value={draft.notes} onChange={(event) => onChange({ ...draft, notes: event.target.value })} placeholder="Contexto adicional" />
        </label>
      </div>
      <datalist id={ownerListId}>
        {ownerOptions.map((owner) => (
          <option key={owner} value={owner} />
        ))}
      </datalist>
    </details>
  );
}
