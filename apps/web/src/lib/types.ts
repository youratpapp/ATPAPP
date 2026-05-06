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
