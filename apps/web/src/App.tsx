import { useCallback, useEffect, useState } from "react";
import { HashRouter, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "./lib/supabase";
import "./App.css";

const TABLE_TOURNAMENTS = "tournaments";
const TABLE_MEMBERS = "tournament_members";

type TournamentRow = {
  id: string;
  name: string;
  owner_id: string;
  updated_at?: string;
};

type MembershipRow = {
  tournament_id: string;
  role: string;
};

type TournamentSummary = {
  id: string;
  name: string;
  ownerId: string;
  updatedAt?: string;
};

type DashboardData = {
  created: TournamentSummary[];
  participating: TournamentSummary[];
};

function withBase(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedPath = String(path || "").replace(/^\/+/, "");
  return `${normalizedBase}${normalizedPath}`;
}

function normalizeTournamentName(name: string): string {
  const txt = String(name ?? "").trim();
  return txt || "Novo Torneio";
}

function buildLegacyUrl(tournamentId?: string): string {
  const legacyPath = withBase("legacy/index.html");
  const id = String(tournamentId ?? "").trim();
  if (!id) return legacyPath;
  return `${legacyPath}?join=${encodeURIComponent(id)}`;
}

function createInitialTournamentData(name: string) {
  return {
    nomeTorneio: normalizeTournamentName(name),
    registrationMode: "hybrid",
    categorias: [],
  };
}

function tournamentToSummary(row: Pick<TournamentRow, "id" | "name" | "owner_id" | "updated_at">): TournamentSummary {
  return {
    id: row.id,
    name: row.name,
    ownerId: row.owner_id,
    updatedAt: row.updated_at,
  };
}

async function loadDashboardData(user: User): Promise<DashboardData> {
  if (!supabase) return { created: [], participating: [] };

  const createdRes = await supabase
    .from(TABLE_TOURNAMENTS)
    .select("id,name,owner_id,updated_at")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });
  if (createdRes.error) throw new Error(createdRes.error.message || "Falha ao carregar torneios criados.");

  const createdRows = (createdRes.data ?? []) as Array<Pick<TournamentRow, "id" | "name" | "owner_id" | "updated_at">>;
  const created = createdRows.map(tournamentToSummary);
  const ownerIds = new Set(created.map((x) => x.id));

  const membersRes = await supabase
    .from(TABLE_MEMBERS)
    .select("tournament_id,role")
    .eq("user_id", user.id);
  if (membersRes.error) throw new Error(membersRes.error.message || "Falha ao carregar participacoes.");

  const memberRows = (membersRes.data ?? []) as MembershipRow[];
  const ids = Array.from(
    new Set(memberRows.map((m) => String(m.tournament_id || "")).filter((id) => id && !ownerIds.has(id)))
  );

  if (!ids.length) return { created, participating: [] };

  const ptRes = await supabase
    .from(TABLE_TOURNAMENTS)
    .select("id,name,owner_id,updated_at")
    .in("id", ids);
  if (ptRes.error) throw new Error(ptRes.error.message || "Falha ao carregar torneios participando.");

  const participatingRows = (ptRes.data ?? []) as Array<Pick<TournamentRow, "id" | "name" | "owner_id" | "updated_at">>;
  const participating = participatingRows
    .map(tournamentToSummary)
    .sort((a, b) => String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? "")));

  return { created, participating };
}

function AppInner() {
  const [bootLoading, setBootLoading] = useState(true);
  const [authUser, setAuthUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;
    const client = supabase;
    if (!client) {
      setBootLoading(false);
      return;
    }

    async function start(currentClient: NonNullable<typeof supabase>) {
      const sess = await currentClient.auth.getSession();
      if (!mounted) return;
      setAuthUser(sess.data.session?.user ?? null);
      setBootLoading(false);
    }
    start(client);

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
      setBootLoading(false);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (!supabaseConfigured) {
    return (
      <main className="page">
        <section className="card">
          <h1>Configuracao necessaria</h1>
          <p>
            Configure o Supabase em <code>apps/web/.env</code> usando <code>.env.example</code>.
          </p>
        </section>
      </main>
    );
  }

  if (bootLoading) {
    return (
      <main className="page">
        <section className="card">
          <h1>Carregando...</h1>
        </section>
      </main>
    );
  }

  if (!authUser) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardPage user={authUser} />} />
      <Route path="/join/:tournamentId" element={<JoinFromLinkPage user={authUser} />} />
      <Route path="/t/:tournamentId" element={<LegacyRedirectPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const login = async () => {
    if (!supabase) return;
    setBusy(true);
    setMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      setMsg(error.message || "Falha no login.");
      return;
    }
    navigate("/dashboard", { replace: true });
  };

  const signUp = async () => {
    if (!supabase) return;
    setBusy(true);
    setMsg("");
    const { error } = await supabase.auth.signUp({ email: email.trim(), password });
    setBusy(false);
    setMsg(error ? error.message || "Falha ao criar conta." : "Conta criada. Faca login.");
  };

  return (
    <main className="page">
      <section className="card auth-card">
        <h1>Entrar</h1>
        <p className="subtle">Acesso ao gerenciador de torneios</p>
        <label>E-mail</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
        <label>Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="minimo 6 caracteres"
        />
        <div className="row">
          <button className="primary" disabled={busy} onClick={login}>
            Entrar
          </button>
          <button disabled={busy} onClick={signUp}>
            Criar conta
          </button>
        </div>
        {msg ? <p className="feedback">{msg}</p> : null}
      </section>
    </main>
  );
}

function DashboardPage({ user }: { user: User }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"created" | "participating">("created");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [newName, setNewName] = useState("");
  const [uuidInput, setUuidInput] = useState("");
  const [created, setCreated] = useState<TournamentSummary[]>([]);
  const [participating, setParticipating] = useState<TournamentSummary[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadDashboardData(user);
      setCreated(data.created);
      setParticipating(data.participating);
      setFeedback("");
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Falha ao atualizar dashboard.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createTournament = async () => {
    if (!supabase) return;
    setBusy(true);
    setFeedback("");
    const name = normalizeTournamentName(newName);
    const payload = {
      owner_id: user.id,
      name,
      data: createInitialTournamentData(name),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from(TABLE_TOURNAMENTS)
      .insert(payload)
      .select("id")
      .single();
    setBusy(false);

    if (error || !data?.id) {
      setFeedback(error?.message || "Falha ao criar torneio.");
      return;
    }

    setNewName("");
    await refresh();
    window.location.assign(buildLegacyUrl(data.id));
  };

  const searchTournament = async () => {
    if (!supabase) return;
    const id = uuidInput.trim();
    if (!id) return;
    setBusy(true);
    const { data, error } = await supabase
      .from(TABLE_TOURNAMENTS)
      .select("id,name,owner_id,updated_at")
      .eq("id", id)
      .maybeSingle();
    setBusy(false);

    if (error) {
      setFeedback(error.message || "Falha ao pesquisar.");
      return;
    }
    if (!data) {
      setFeedback("UUID nao encontrado.");
      return;
    }

    const role = data.owner_id === user.id ? "Criador" : "Disponivel para participacao";
    setFeedback(`Encontrado: ${data.name} (${role})`);
  };

  const joinByUuid = async (idRaw?: string) => {
    if (!supabase) return;
    const id = String(idRaw ?? uuidInput).trim();
    if (!id) return;

    setBusy(true);
    const exists = await supabase
      .from(TABLE_TOURNAMENTS)
      .select("id,name,owner_id")
      .eq("id", id)
      .maybeSingle();
    if (exists.error || !exists.data) {
      setBusy(false);
      setFeedback(exists.error?.message || "Torneio nao encontrado.");
      return;
    }

    if (exists.data.owner_id !== user.id) {
      const up = await supabase
        .from(TABLE_MEMBERS)
        .upsert({ tournament_id: id, user_id: user.id, role: "participant" }, { onConflict: "tournament_id,user_id" });
      if (up.error) {
        setBusy(false);
        setFeedback(up.error.message || "Falha ao participar.");
        return;
      }
    }

    setBusy(false);
    await refresh();
    window.location.assign(buildLegacyUrl(id));
  };

  const copyInviteLink = (id: string) => {
    const link = `${window.location.origin}${buildLegacyUrl(id)}`;
    navigator.clipboard
      .writeText(link)
      .then(() => setFeedback("Link copiado."))
      .catch(() => setFeedback(`Copie manualmente: ${link}`));
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  const currentList = tab === "created" ? created : participating;

  return (
    <main className="page">
      <section className="card">
        <div className="header-line">
          <div>
            <h1>Dashboard</h1>
            <p className="subtle">{user.email}</p>
          </div>
          <button onClick={signOut}>Sair</button>
        </div>

        <div className="tabs">
          <button className={tab === "created" ? "active" : ""} onClick={() => setTab("created")}>
            Criados por mim
          </button>
          <button className={tab === "participating" ? "active" : ""} onClick={() => setTab("participating")}>
            Estou participando
          </button>
        </div>

        {tab === "created" ? (
          <section className="box">
            <label>Nome do novo torneio</label>
            <div className="row">
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex.: Aberto Primavera" />
              <button className="primary" disabled={busy} onClick={createTournament}>
                Criar
              </button>
              <button disabled={busy} onClick={refresh}>
                Atualizar
              </button>
            </div>
          </section>
        ) : (
          <section className="box">
            <label>Entrar por UUID</label>
            <div className="row">
              <input value={uuidInput} onChange={(e) => setUuidInput(e.target.value)} placeholder="Cole o UUID" />
              <button disabled={busy} onClick={searchTournament}>
                Pesquisar
              </button>
              <button className="primary" disabled={busy} onClick={() => joinByUuid()}>
                Participar
              </button>
            </div>
          </section>
        )}

        {feedback ? <p className="feedback">{feedback}</p> : null}

        <section className="list-wrap">
          <h2>{tab === "created" ? "Torneios criados" : "Torneios participando"}</h2>
          {loading ? <p className="subtle">Carregando...</p> : null}
          {!loading && tab === "created" && created.length === 0 ? <p className="subtle">Nenhum torneio criado.</p> : null}
          {!loading && tab === "participating" && participating.length === 0 ? (
            <p className="subtle">Voce ainda nao participa de torneios.</p>
          ) : null}

          {currentList.map((t) => (
            <article key={t.id} className="list-item">
              <div>
                <p className="item-title">{t.name}</p>
                <p className="item-sub">UUID: {t.id}</p>
              </div>
              <div className="row tight">
                <button className="primary" onClick={() => window.location.assign(buildLegacyUrl(t.id))}>
                  Abrir
                </button>
                {tab === "created" ? <button onClick={() => copyInviteLink(t.id)}>Copiar link</button> : null}
                {tab === "participating" ? <button onClick={() => setUuidInput(t.id)}>Usar UUID</button> : null}
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}

function JoinFromLinkPage({ user }: { user: User }) {
  const { tournamentId } = useParams();
  const [msg, setMsg] = useState("Processando convite...");

  useEffect(() => {
    async function run() {
      if (!supabase || !tournamentId) return;
      const exists = await supabase
        .from(TABLE_TOURNAMENTS)
        .select("id,owner_id")
        .eq("id", tournamentId)
        .maybeSingle();

      if (exists.error || !exists.data) {
        setMsg(exists.error?.message || "Torneio nao encontrado.");
        return;
      }

      if (exists.data.owner_id !== user.id) {
        const up = await supabase
          .from(TABLE_MEMBERS)
          .upsert(
            { tournament_id: tournamentId, user_id: user.id, role: "participant" },
            { onConflict: "tournament_id,user_id" }
          );
        if (up.error) {
          setMsg(up.error.message || "Falha ao entrar no torneio.");
          return;
        }
      }

      window.location.replace(buildLegacyUrl(tournamentId));
    }

    run();
  }, [tournamentId, user.id]);

  return (
    <main className="page">
      <section className="card">
        <h1>Convite</h1>
        <p className="subtle">{msg}</p>
      </section>
    </main>
  );
}

function LegacyRedirectPage() {
  const { tournamentId } = useParams();

  useEffect(() => {
    window.location.replace(buildLegacyUrl(tournamentId));
  }, [tournamentId]);

  return (
    <main className="page">
      <section className="card">
        <h1>Abrindo torneio...</h1>
        <p className="subtle">Redirecionando para o modo completo.</p>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppInner />
    </HashRouter>
  );
}
