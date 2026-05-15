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

export type PlaceProductPlan = "club_basic" | "academy" | "club_pro" | "multi_unit";

export type Place = {
  id: string;
  ownerId: string;
  organizationId: string;
  productPlan: PlaceProductPlan;
  name: string;
  city: string;
  state: string;
  description: string;
  logoUrl: string;
  coverUrl: string;
  followerCount: number;
  isFollowing: boolean;
};

export type PlaceOrganization = {
  id: string;
  ownerId: string;
  name: string;
  city: string;
  state: string;
  createdAt: string;
};

export type PlaceStaffMember = {
  placeId: string;
  userId: string | null;
  email: string;
  role: "manager" | "coach" | "frontdesk" | "finance";
  createdAt: string;
  status?: "active" | "pending";
};

export type PlaceCourt = {
  id: string;
  placeId: string;
  name: string;
  surface: string;
  bookingFeeCents: number;
  memberBookingFeeCents: number | null;
  isActive: boolean;
};

export type AvailableCourt = PlaceCourt & {
  effectiveFeeCents: number;
  isMemberPrice: boolean;
  ruleId: string;
  ruleName: string;
  requiresApproval: boolean;
};

export type PlaceBookingRule = {
  id: string;
  placeId: string;
  name: string;
  profileScope: "all" | "public" | "member";
  weekdays: number[];
  startsAt: string;
  endsAt: string;
  priceCents: number | null;
  memberPriceCents: number | null;
  minMinutes: number;
  maxMinutes: number;
  advanceDays: number;
  requiresApproval: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlaceMembershipPlan = {
  id: string;
  placeId: string;
  name: string;
  monthlyFeeCents: number;
  courtDiscountPercent: number;
  academyDiscountPercent: number;
  isActive: boolean;
  createdAt: string;
};

export type PlaceMembership = {
  id: string;
  placeId: string;
  planId: string;
  userId: string;
  memberName: string;
  phone: string;
  status: "pending" | "active" | "cancelled";
  startsOn: string;
  endsOn: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type PlaceCrmContact = {
  id: string;
  placeId: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  interest: string;
  status: "lead" | "contacted" | "converted" | "archived";
  notes: string;
  nextContactOn: string;
  ownerLabel: string;
  createdAt: string;
  updatedAt: string;
};

export type PlaceCrmInteraction = {
  id: string;
  placeId: string;
  contactId: string;
  interactionType: "note" | "call" | "whatsapp" | "email" | "visit" | "follow_up";
  body: string;
  nextContactOn: string;
  createdAt: string;
};

export type PlaceCreditPackage = {
  id: string;
  placeId: string;
  name: string;
  packageType: "court_credit" | "lesson_credit" | "day_pass";
  quantity: number;
  priceCents: number;
  validityDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlaceCreditPurchase = {
  id: string;
  placeId: string;
  packageId: string | null;
  packageName: string;
  packageType: "court_credit" | "lesson_credit" | "day_pass";
  buyerName: string;
  phone: string;
  initialQuantity: number;
  remainingQuantity: number;
  amountCents: number;
  purchasedOn: string;
  expiresOn: string;
  status: "active" | "used" | "expired" | "cancelled";
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type PlacePosProduct = {
  id: string;
  placeId: string;
  name: string;
  category: string;
  priceCents: number;
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlacePosSale = {
  id: string;
  placeId: string;
  productId: string;
  productName: string;
  buyerName: string;
  quantity: number;
  unitAmountCents: number;
  totalAmountCents: number;
  status: "paid" | "cancelled";
  soldAt: string;
  createdAt: string;
  updatedAt: string;
};

export type PlaceExpense = {
  id: string;
  placeId: string;
  category: string;
  description: string;
  amountCents: number;
  spentOn: string;
  status: "posted" | "cancelled";
  createdAt: string;
  updatedAt: string;
};

export type CourtBooking = {
  id: string;
  placeId: string;
  placeName: string;
  courtId: string;
  courtName: string;
  userId: string;
  playerName: string;
  phone: string;
  startsAt: string;
  endsAt: string;
  status: "pending" | "confirmed" | "cancelled" | "blocked";
  notes: string;
  recurrenceGroupId: string;
  recurrenceIndex: number;
  recurrenceTotal: number;
  createdAt: string;
};

export type CourtBookingWaitlistEntry = {
  id: string;
  placeId: string;
  courtId: string;
  courtName: string;
  userId: string;
  playerName: string;
  phone: string;
  startsAt: string;
  endsAt: string;
  status: "waiting" | "invited" | "cancelled" | "booked";
  notes: string;
  createdAt: string;
};

export type AcademyClass = {
  id: string;
  placeId: string;
  coachId: string | null;
  courtId: string | null;
  title: string;
  coachName: string;
  weekday: number;
  startsAt: string;
  endsAt: string;
  level: string;
  genderScope: "male" | "female" | "mixed";
  ageGroup: "kids" | "adult";
  minAge: number | null;
  maxAge: number | null;
  allowMakeup: boolean;
  capacity: number;
  monthlyFeeCents: number;
  isActive: boolean;
};

export type AcademyCoach = {
  id: string;
  placeId: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string;
  commissionPercent: number;
  specialties: string[];
  levelScopes: string[];
  publicBio: string;
  internalNotes: string;
  publicProfileEnabled: boolean;
  isActive: boolean;
};

export type AcademySlot = {
  id: string;
  placeId: string;
  coachId: string | null;
  courtId: string | null;
  weekday: number;
  startsAt: string;
  endsAt: string;
  capacity: number;
  status: "open" | "assigned" | "blocked";
  notes: string;
};

export type AcademyEnrollment = {
  id: string;
  placeId: string;
  classId: string;
  contractId: string | null;
  userId: string | null;
  playerName: string;
  phone: string;
  status: "pending" | "active" | "cancelled";
  notes: string;
  source: "online" | "admin" | "linked";
  createdAt: string;
};

export type AcademyAttendance = {
  id: string;
  placeId: string;
  classId: string;
  enrollmentId: string;
  userId: string | null;
  attendedOn: string;
  status: "present" | "absent";
  notes: string;
  markedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type AcademyPlannedAbsence = {
  id: string;
  placeId: string;
  classId: string;
  enrollmentId: string;
  userId: string | null;
  absenceOn: string;
  status: "open" | "used" | "cancelled";
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type AcademyLessonFitSlot = {
  classId: string;
  placeId: string;
  title: string;
  coachId: string | null;
  coachName: string;
  courtId: string | null;
  weekday: number;
  startsAt: string;
  endsAt: string;
  level: string;
  genderScope: "male" | "female" | "mixed";
  ageGroup: "kids" | "adult";
  minAge: number | null;
  maxAge: number | null;
  capacity: number;
  activeEnrollments: number;
  openAbsences: number;
  approvedRequests: number;
  availableSpots: number;
  monthlyFeeCents: number;
};

export type AcademyLessonRequest = {
  id: string;
  placeId: string;
  classId: string;
  absenceId: string | null;
  makeupCreditId: string | null;
  requestedBy: string | null;
  requestedOn: string;
  requestType: "makeup" | "drop_in";
  playerName: string;
  phone: string;
  email: string;
  age: number | null;
  levelLabel: string;
  notes: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  paymentStatus: "pending" | "paid" | "waived";
  amountCents: number;
  approvedBy: string | null;
  approvedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type AcademyMakeupCredit = {
  id: string;
  placeId: string;
  classId: string;
  enrollmentId: string;
  userId: string | null;
  sourceAttendanceId: string;
  sourceAbsenceId: string;
  status: "open" | "used" | "cancelled";
  notes: string;
  usedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type AcademyStudentContract = {
  id: string;
  placeId: string;
  userId: string | null;
  inviteEmail: string;
  studentName: string;
  phone: string;
  status: "pending" | "active" | "cancelled";
  weeklyLessonsCount: number;
  monthlyFeeCents: number;
  startsOn: string;
  endsOn: string;
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type AcademySettings = {
  placeId: string;
  makeupNoticeHours: number;
  autoCreateMakeupCreditOnNotice: boolean;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AcademyProgressNote = {
  id: string;
  placeId: string;
  classId: string;
  enrollmentId: string;
  userId: string | null;
  levelLabel: string;
  focus: string;
  notes: string;
  markedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type OpenMatch = {
  id: string;
  creatorId: string;
  placeId: string | null;
  placeName: string;
  city: string;
  state: string;
  startsAt: string;
  level: string;
  notes: string;
  status: "open" | "closed" | "cancelled";
  createdAt: string;
  participantCount: number;
  commentCount: number;
  reactionCount: number;
  joinedByMe: boolean;
  reactedByMe: boolean;
};

export type OpenMatchComment = {
  id: string;
  openMatchId: string;
  userId: string;
  body: string;
  createdAt: string;
};

export type NotificationPreferences = {
  whatsappReminders: boolean;
  matchReminders: boolean;
  bookingReminders: boolean;
  socialUpdates: boolean;
  reminderHoursBefore: number;
};

export type AppPayment = {
  id: string;
  userId: string;
  targetType: string;
  targetId: string;
  amountCents: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded";
  provider: string;
  description: string;
  metadata: Record<string, unknown>;
  billingPeriod: string;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
};

export type AppPaymentReminder = {
  id: string;
  placeId: string;
  userId: string;
  targetType: string;
  targetId: string;
  billingPeriod: string;
  channel: "manual" | "whatsapp" | "email" | "push";
  status: "queued" | "sent" | "cancelled";
  message: string;
  createdAt: string;
  updatedAt: string;
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
  playerResultSubmissionEnabled: boolean;
  registrationFeeCents: number;
};

export type TournamentDetails = TournamentSummary & {
  createdAt: string;
  data: Record<string, unknown>;
  role: TournamentRole;
};

export type TournamentRole = "owner" | "organizer" | "scorekeeper" | "checkin" | "media" | "participant" | "viewer";

export type TournamentStaffRole = Extract<TournamentRole, "organizer" | "scorekeeper" | "checkin" | "media">;

export type TournamentStaffMember = {
  tournamentId: string;
  userId: string | null;
  email: string;
  displayName?: string;
  role: TournamentStaffRole;
  createdAt: string;
  status?: "active" | "pending";
};

export type TournamentStaffCandidate = {
  userId: string;
  email: string;
  displayName: string;
};

export type TournamentStaffInvite = {
  id: string;
  tournamentId: string;
  tournamentName: string;
  email: string;
  role: TournamentStaffRole;
  createdAt: string;
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
  status: "pending" | "approved" | "waitlist" | "rejected";
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

export type TournamentMatchResultSubmission = {
  id: string;
  tournamentId: string;
  submittedBy: string;
  classKey: string;
  classLabel: string;
  phaseKey: string;
  phaseLabel: string;
  matchIndex: number;
  side: "a" | "b";
  matchTitle: string;
  scoreText: string;
  normalizedScore: string;
  status: "pending" | "accepted" | "conflict" | "applied" | "rejected";
  createdAt: string;
  updatedAt: string;
};

export type TournamentMatchConfirmation = {
  id: string;
  tournamentId: string;
  userId: string;
  classKey: string;
  classLabel: string;
  phaseKey: string;
  phaseLabel: string;
  matchIndex: number;
  side: "a" | "b";
  matchTitle: string;
  status: "confirmed" | "unavailable";
  createdAt: string;
  updatedAt: string;
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
  autoRoundGenerationEnabled: boolean;
  registrationFeeCents: number;
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
  promotedSlots: number;
  relegatedSlots: number;
};

export type LeaguePlayerStanding = {
  id: string;
  leagueId: string;
  seasonId: string;
  classId: string | null;
  userId: string | null;
  displayName: string;
  phone: string;
  status: "active" | "inactive" | "recesso";
  matchesPlayed: number;
  wins: number;
  losses: number;
  setsFor: number;
  setsAgainst: number;
  gamesFor: number;
  gamesAgainst: number;
  rankingPoints: number;
  woAgainst: number;
};

export type LeagueRankingSnapshot = {
  id: string;
  leagueId: string;
  seasonId: string;
  classId: string | null;
  roundId: string | null;
  computedAt: string;
  ranking: Array<Record<string, unknown>>;
};

export type PublicRankingRow = {
  leaguePlayerId: string;
  leagueId: string;
  leagueName: string;
  seasonId: string;
  seasonName: string;
  classId: string | null;
  categoryName: string;
  className: string;
  displayName: string;
  userId: string | null;
  city: string;
  state: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  setsFor: number;
  setsAgainst: number;
  gamesFor: number;
  gamesAgainst: number;
  rankingPoints: number;
  woAgainst: number;
  position: number;
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

export type LeagueSchedulerRun = {
  id: string;
  executedAt: string;
  generatedCount: number;
  details: Array<Record<string, unknown>>;
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
  registrationFeeCents: number;
};

export type LeagueChatMessage = {
  id: string;
  leagueId: string;
  senderUserId: string;
  senderName: string;
  messageType: "chat" | "announcement";
  body: string;
  isPinned: boolean;
  pinnedAt: string;
  createdAt: string;
};
