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
  draft: PlaceCrmContactDraft;
  ownerListId: string;
  ownerOptions: string[];
  onChange: (draft: PlaceCrmContactDraft) => void;
  onSubmit: () => void;
};

export function PlaceCrmContactForm({ busy, draft, ownerListId, ownerOptions, onChange, onSubmit }: PlaceCrmContactFormProps) {
  return (
    <div className="place-staff-form">
      <input value={draft.name} onChange={(event) => onChange({ ...draft, name: event.target.value })} placeholder="Nome" />
      <input value={draft.phone} onChange={(event) => onChange({ ...draft, phone: event.target.value })} placeholder="Telefone" />
      <input value={draft.email} onChange={(event) => onChange({ ...draft, email: event.target.value })} placeholder="Email" />
      <input value={draft.source} onChange={(event) => onChange({ ...draft, source: event.target.value })} placeholder="Origem" />
      <input value={draft.interest} onChange={(event) => onChange({ ...draft, interest: event.target.value })} placeholder="Interesse" />
      <input value={draft.notes} onChange={(event) => onChange({ ...draft, notes: event.target.value })} placeholder="Notas" />
      <input type="date" value={draft.nextContactOn} onChange={(event) => onChange({ ...draft, nextContactOn: event.target.value })} aria-label="Proximo contato" />
      <input
        list={ownerListId}
        value={draft.ownerLabel}
        onChange={(event) => onChange({ ...draft, ownerLabel: event.target.value })}
        placeholder="Responsavel"
      />
      <datalist id={ownerListId}>
        {ownerOptions.map((owner) => (
          <option key={owner} value={owner} />
        ))}
      </datalist>
      <button type="button" onClick={onSubmit} disabled={busy || !draft.name.trim()}>
        Criar contato
      </button>
    </div>
  );
}
