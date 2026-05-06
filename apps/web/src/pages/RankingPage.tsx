import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import type { Profile } from "../lib/types";

type Props = {
  user: User;
  profile: Profile | null;
};

export function RankingPage({ user, profile }: Props) {
  return (
    <AppShell user={user} profile={profile}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Ranking</h1>
        <p>🎉 <strong>Novidade chegando!</strong></p>
        <p className="subtle">
          O ranking ATP estará disponível em breve. Acompanhe sua posição e a dos outros atletas
          nos torneios e veja quem está dominando as quadras 🏆
        </p>
        <p className="subtle">Fique ligado 👀</p>
      </div>
    </AppShell>
  );
}
