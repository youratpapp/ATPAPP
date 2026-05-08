export type Profile = {
  userId: string;
  displayName: string;
  photoUrl: string;
  city: string;
  state: string;
  phone: string;
  birthDate: string;
  instagram: string;
  bio: string;
};

export type Place = {
  id: string;
  ownerId: string;
  name: string;
  city: string;
  state: string;
  description: string;
  logoUrl: string;
  coverUrl: string;
  followerCount: number;
  isFollowing: boolean;
};

export type TournamentSummary = {
  id: string;
  name: string;
  ownerId: string;
  city: string;
  state: string;
  visibility: string;
  status: string;
  posterUrl: string;
  startsAt: string;
  registrationCloseAt: string;
  updatedAt: string;
};

export type TournamentDetails = TournamentSummary & {
  createdAt: string;
  data: Record<string, unknown>;
  role: "owner" | "participant" | "viewer";
};

export type TournamentRegistration = {
  id: string;
  tournamentId: string;
  userId: string;
  categoryId: string;
  classId: string;
  categoryName: string;
  className: string;
  playerName: string;
  phone: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export type TournamentChatMessage = {
  id: string;
  tournamentId: string;
  senderUserId: string;
  senderName: string;
  messageType: "chat" | "announcement";
  body: string;
  isPinned: boolean;
  pinnedAt: string;
  createdAt: string;
};

export type LeagueSummary = {
  id: string;
  name: string;
  ownerId: string;
  leagueType: "simples" | "dupla_fixa" | "dupla_rotativa";
  category: string;
  classScope: string;
  status: "draft" | "active" | "paused" | "finished";
  visibility: "private" | "public";
  role: "owner" | "participant";
  updatedAt: string;
};

export type LeagueSeasonSummary = {
  id: string;
  name: string;
  seasonNumber: number;
  status: "draft" | "active" | "finished" | "archived";
  currentRoundNumber: number;
  startsAt: string;
  endsAt: string;
};

export type LeagueDetails = {
  id: string;
  ownerId: string;
  name: string;
  leagueType: "simples" | "dupla_fixa" | "dupla_rotativa";
  category: string;
  classScope: string;
  matchFormat: string;
  roundsTotal: number;
  roundInterval: string;
  roundIntervalDays: number;
  resultDeadlineDays: number;
  toleranceDays: number;
  promotedCount: number;
  relegatedCount: number;
  maxRecesses: number;
  wildcardEnabled: boolean;
  noAdEnabled: boolean;
  tieBreakRule: string;
  woRule: string;
  publicJoinEnabled: boolean;
  joinRequiresApproval: boolean;
  status: "draft" | "active" | "paused" | "finished";
  visibility: "private" | "public";
  updatedAt: string;
  seasons: LeagueSeasonSummary[];
};

export type LeagueClassSummary = {
  id: string;
  seasonId: string;
  categoryName: string;
  className: string;
  levelOrder: number;
};

export type LeagueRegistration = {
  id: string;
  leagueId: string;
  seasonId: string | null;
  classId: string | null;
  userId: string;
  playerName: string;
  phone: string;
  status: "pending" | "approved" | "rejected";
  source: "public" | "link" | "admin";
  createdAt: string;
};

export type LeagueMatchParticipant = {
  leaguePlayerId: string | null;
  userId: string | null;
  side: 1 | 2;
  slot: 1 | 2;
  displayName: string;
  phone: string;
};

export type LeagueMatchSummary = {
  id: string;
  roundId: string;
  classId: string | null;
  status:
    | "aguardando_organizacao"
    | "aguardando_resultado"
    | "aguardando_confirmacao"
    | "encerrada"
    | "wo"
    | "em_disputa"
    | "em_analise_adm";
  scheduledAt: string;
  resultPayload: Record<string, unknown>;
  participants: LeagueMatchParticipant[];
};

export type LeagueRoundSummary = {
  id: string;
  classId: string | null;
  roundNumber: number;
  startsAt: string;
  endsAt: string;
  status: "open" | "locked" | "finished";
};

export type LeagueResultSubmission = {
  id: string;
  matchId: string;
  submittedByUserId: string | null;
  status: "pending" | "confirmed" | "rejected";
  payload: Record<string, unknown>;
  createdAt: string;
};

export type LeagueMatchAvailability = {
  id: string;
  matchId: string;
  leaguePlayerId: string;
  optionNo: number;
  availableAt: string;
  playerName: string;
};

export type LeagueMatchMessage = {
  id: string;
  matchId: string;
  senderUserId: string | null;
  body: string;
  createdAt: string;
};

export type LeagueJoinContext = {
  leagueId: string;
  leagueName: string;
  leagueType: "simples" | "dupla_fixa" | "dupla_rotativa";
  visibility: "private" | "public";
  publicJoinEnabled: boolean;
  joinRequiresApproval: boolean;
  seasonId: string | null;
  seasonName: string | null;
  classId: string | null;
  categoryName: string | null;
  className: string | null;
};
