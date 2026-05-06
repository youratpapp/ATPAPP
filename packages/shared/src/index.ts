export type UserRole = "owner" | "participant" | "guest";

export interface TournamentSummary {
  id: string;
  name: string;
  ownerId: string;
  updatedAt?: string;
}

export interface UserTournamentAccess {
  tournamentId: string;
  role: UserRole;
  canEdit: boolean;
}

export function resolveTournamentRole(
  tournament: Pick<TournamentSummary, "ownerId"> | null | undefined,
  userId: string | null | undefined
): UserRole {
  if (!tournament || !userId) return "guest";
  return tournament.ownerId === userId ? "owner" : "participant";
}

export function canEditTournament(
  tournament: Pick<TournamentSummary, "ownerId"> | null | undefined,
  userId: string | null | undefined
): boolean {
  return resolveTournamentRole(tournament, userId) === "owner";
}
