import { SetupWizard } from "../SetupWizard";
import { BRAZILIAN_STATES, normalizeStateUf } from "../../lib/brazil-location";
import type { PlaceOrganization, PlaceProductPlan } from "../../lib/types";

type PlaceCreateWizardProps = {
  busy: boolean;
  city: string;
  cityLoadError: string;
  cityLoading: boolean;
  cityOptions: string[];
  cityValueInOptions: boolean;
  description: string;
  name: string;
  organizationId: string;
  organizationName: string;
  organizations: PlaceOrganization[];
  planHints: Record<PlaceProductPlan, string>;
  planLabels: Record<PlaceProductPlan, string>;
  productPlan: PlaceProductPlan;
  stateUf: string;
  onCancel: () => void;
  onCityChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onFinish: () => void;
  onLogoChange: (file: File | null) => void;
  onNameChange: (value: string) => void;
  onOrganizationIdChange: (value: string) => void;
  onOrganizationNameChange: (value: string) => void;
  onProductPlanChange: (value: PlaceProductPlan) => void;
  onStateUfChange: (value: string) => void;
};

export function PlaceCreateWizard({
  busy,
  city,
  cityLoadError,
  cityLoading,
  cityOptions,
  cityValueInOptions,
  description,
  name,
  organizationId,
  organizationName,
  organizations,
  planHints,
  planLabels,
  productPlan,
  stateUf,
  onCancel,
  onCityChange,
  onDescriptionChange,
  onFinish,
  onLogoChange,
  onNameChange,
  onOrganizationIdChange,
  onOrganizationNameChange,
  onProductPlanChange,
  onStateUfChange,
}: PlaceCreateWizardProps) {
  const normalizedUf = normalizeStateUf(stateUf);

  return (
    <SetupWizard
      busy={busy}
      title="Novo local"
      subtitle="Configure o basico em etapas curtas. A operacao fina fica no admin do local."
      cancelLabel="Cancelar"
      finishLabel="Criar local"
      onCancel={onCancel}
      onFinish={onFinish}
      steps={[
        {
          id: "identity",
          label: "Identidade",
          detail: name.trim() || "Nome e plano",
          canContinue: Boolean(name.trim()),
          content: (
            <div className="place-create-step">
              <label>Nome</label>
              <input value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="Ex.: Cesao Tenis Club" />
              <label>Plano inicial</label>
              <select value={productPlan} onChange={(event) => onProductPlanChange(event.target.value as PlaceProductPlan)}>
                {Object.entries(planLabels).map(([value, label]) => (
                  <option key={`new-place-plan:${value}`} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <p className="modal-helper">{planHints[productPlan]}</p>
            </div>
          ),
        },
        {
          id: "location",
          label: "Localizacao",
          detail: city && normalizedUf ? `${city} - ${normalizedUf}` : "Cidade e rede",
          canContinue: Boolean(city.trim() && normalizedUf),
          content: (
            <div className="place-create-step">
              <label>Organizacao / rede</label>
              <select value={organizationId} onChange={(event) => onOrganizationIdChange(event.target.value)}>
                <option value="">Sem organizacao</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
              {!organizationId ? (
                <input value={organizationName} onChange={(event) => onOrganizationNameChange(event.target.value)} placeholder="Criar nova organizacao/rede" />
              ) : null}
              <div className="row">
                <div>
                  <label>UF</label>
                  <select
                    value={stateUf}
                    onChange={(event) => {
                      onStateUfChange(normalizeStateUf(event.target.value));
                      onCityChange("");
                    }}
                  >
                    <option value="">Selecione</option>
                    {BRAZILIAN_STATES.map((state) => (
                      <option key={`place-state:${state.uf}`} value={state.uf}>
                        {state.uf} - {state.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Cidade</label>
                  <select value={city} onChange={(event) => onCityChange(event.target.value)} disabled={!normalizedUf || cityLoading}>
                    <option value="">
                      {!normalizedUf ? "Selecione o estado primeiro" : cityLoading ? "Carregando municipios..." : "Selecione o municipio"}
                    </option>
                    {cityValueInOptions ? null : city.trim() ? <option value={city}>{city}</option> : null}
                    {cityOptions.map((cityName) => (
                      <option key={`place-city:${cityName}`} value={cityName}>
                        {cityName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {cityLoadError ? <p className="feedback error">{cityLoadError}</p> : null}
            </div>
          ),
        },
        {
          id: "brand",
          label: "Pagina",
          detail: description.trim() ? "Descricao informada" : "Descricao e logo",
          content: (
            <div className="place-create-step">
              <label>Descricao</label>
              <textarea
                value={description}
                onChange={(event) => onDescriptionChange(event.target.value)}
                placeholder="Horarios, WhatsApp, regras de reserva, endereco complementar..."
              />
              <label>Logo opcional</label>
              <input type="file" accept="image/*" onChange={(event) => onLogoChange(event.target.files?.[0] ?? null)} />
              <div className="place-create-review">
                <strong>{name.trim() || "Nome do local"}</strong>
                <span>{city && normalizedUf ? `${city} - ${normalizedUf}` : "Localizacao pendente"}</span>
                <small>{planLabels[productPlan]}</small>
              </div>
            </div>
          ),
        },
      ]}
    />
  );
}
