import { Link } from "react-router-dom";

type Props = {
  userId?: string | null;
  name: string;
  className?: string;
};

export function PlayerProfileLink({ userId, name, className = "" }: Props) {
  const label = name || "Jogador";
  if (!userId) return <span className={className}>{label}</span>;
  return (
    <Link className={`player-profile-link ${className}`.trim()} to={`/jogadores/${encodeURIComponent(userId)}`}>
      {label}
    </Link>
  );
}
