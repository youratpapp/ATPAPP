import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import type { Profile } from "../lib/types";

type Props = {
  user: User;
  profile: Profile | null;
};

export function RankingPage({ user, profile }: Props) {
  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      <div className="page-header">
        <h1>Ranking</h1>
      </div>

      <div className="ranking-coming-soon">
        <span className="rcs-emoji" role="img" aria-label="festa">🎉</span>
        <h2>Novidade chegando!</h2>
        <p>
          A funcionalidade de Ranking do ATP APP estará disponível em breve.
        </p>
        <p>
          Acompanhe sua posição e a dos demais atletas nos torneios e veja quem está dominando as quadras! 🏆
        </p>
        <p style={{ marginTop: 24 }}>Fique ligado! 👀</p>
      </div>
    </AppShell>
  );
}
