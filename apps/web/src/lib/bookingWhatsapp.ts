import type { CourtBooking, CourtBookingWaitlistEntry, PlaceCourt } from "./types";

type BookingWhatsappContext = {
  alternatives?: BookingWhatsappAlternative[];
  changeUrl?: string;
  placeName: string;
  senderName: string;
};

type WaitlistWhatsappContext = BookingWhatsappContext & {
  alternatives: BookingWhatsappAlternative[];
  promotable: boolean;
};

export type BookingRescheduleOption = {
  courtId: string;
  courtName: string;
  endsAt: string;
  label: string;
  startsAt: string;
};

export type BookingWhatsappAlternative =
  | string
  | {
      label: string;
      url?: string;
    };

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function normalizeBrazilPhone(value: string): string {
  const digits = onlyDigits(value);
  if (!digits) return "";
  if (digits.startsWith("55")) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

export function whatsappHref(phone: string, message: string): string {
  const normalizedPhone = normalizeBrazilPhone(phone);
  if (!normalizedPhone) return "";
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

function formatSlot(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Horario a confirmar";
  const date = start.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const startTime = start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const endTime = end.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${date}, das ${startTime} as ${endTime}`;
}

function formatOption(courtName: string, startsAt: string, endsAt: string): string {
  return `${courtName || "Quadra"} - ${formatSlot(startsAt, endsAt)}`;
}

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && aEnd > bStart;
}

type BookingSlotLike = {
  courtId: string;
  courtName: string;
  endsAt: string;
  startsAt: string;
};

export function buildBookingRescheduleAlternatives(
  entry: BookingSlotLike,
  courts: PlaceCourt[],
  bookings: CourtBooking[],
  limit = 3,
  ignoredBookingId = ""
): string[] {
  return buildBookingRescheduleOptions(entry, courts, bookings, limit, ignoredBookingId).map((option) => option.label);
}

export function buildBookingRescheduleOptions(
  entry: BookingSlotLike,
  courts: PlaceCourt[],
  bookings: CourtBooking[],
  limit = 3,
  ignoredBookingId = ""
): BookingRescheduleOption[] {
  const startMs = new Date(entry.startsAt).getTime();
  const endMs = new Date(entry.endsAt).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) return [];

  const durationMs = endMs - startMs;
  const minStartMs = Date.now() - 5 * 60 * 1000;
  const courtById = new Map(courts.map((court) => [court.id, court]));
  const options: Array<{ courtId: string; courtName: string; startsAt: string; endsAt: string; priority: number }> = [];
  const seen = new Set<string>();

  const isFree = (courtId: string, candidateStartMs: number, candidateEndMs: number) => {
    if (candidateStartMs < minStartMs) return false;
    return !bookings.some((booking) => {
      if (ignoredBookingId && booking.id === ignoredBookingId) return false;
      if (booking.courtId !== courtId || booking.status === "cancelled") return false;
      const bookingStart = new Date(booking.startsAt).getTime();
      const bookingEnd = new Date(booking.endsAt).getTime();
      return rangesOverlap(candidateStartMs, candidateEndMs, bookingStart, bookingEnd);
    });
  };

  const addOption = (courtId: string, candidateStartMs: number, priority: number) => {
    const candidateEndMs = candidateStartMs + durationMs;
    const key = `${courtId}:${candidateStartMs}`;
    if (seen.has(key) || !isFree(courtId, candidateStartMs, candidateEndMs)) return;
    seen.add(key);
    const courtName = courtById.get(courtId)?.name || (courtId === entry.courtId ? entry.courtName : "Quadra");
    options.push({
      courtId,
      courtName,
      startsAt: new Date(candidateStartMs).toISOString(),
      endsAt: new Date(candidateEndMs).toISOString(),
      priority,
    });
  };

  courts
    .filter((court) => court.isActive && court.id !== entry.courtId)
    .forEach((court, index) => addOption(court.id, startMs, index));

  [-30, 30, -60, 60, -90, 90, -120, 120, -180, 180].forEach((minutes, index) => {
    addOption(entry.courtId, startMs + minutes * 60 * 1000, 100 + index);
  });

  if (options.length < limit) {
    [1, 2, 3].forEach((days, index) => {
      addOption(entry.courtId, startMs + days * 24 * 60 * 60 * 1000, 300 + index);
      courts
        .filter((court) => court.isActive && court.id !== entry.courtId)
        .slice(0, Math.max(0, limit - options.length))
        .forEach((court, courtIndex) => addOption(court.id, startMs + days * 24 * 60 * 60 * 1000, 350 + index * 10 + courtIndex));
    });
  }

  return options
    .sort((a, b) => a.priority - b.priority)
    .slice(0, limit)
    .map((option) => ({
      courtId: option.courtId,
      courtName: option.courtName,
      startsAt: option.startsAt,
      endsAt: option.endsAt,
      label: formatOption(option.courtName, option.startsAt, option.endsAt),
    }));
}

function alternativesMessageBlock(alternatives: BookingWhatsappAlternative[]): string {
  if (!alternatives.length) return "Ainda vamos consultar as melhores opcoes para reagendar.";
  return `Temos estas opcoes proximas:\n${alternatives
    .map((item, index) => {
      const alternative = typeof item === "string" ? { label: item, url: "" } : item;
      const lines = [`${index + 1}. ${alternative.label}`];
      if (alternative.url) lines.push(`   Confirmar alteracao: ${alternative.url}`);
      return lines.join("\n");
    })
    .join("\n")}`;
}

export function bookingWhatsappHref(booking: CourtBooking, context: BookingWhatsappContext): string {
  const placeName = context.placeName || booking.placeName || "ATP";
  const senderName = context.senderName || "Equipe ATP";
  const courtName = booking.courtName || "Quadra";
  const slot = formatSlot(booking.startsAt, booking.endsAt);
  const playerName = booking.playerName || "jogador";
  const isCancelled = booking.status === "cancelled";
  const alternatives = context.alternatives || [];
  const alternativesBlock = alternativesMessageBlock(alternatives);
  const changeUrl = context.changeUrl || "";

  const message = isCancelled
    ? [
        `Ola, ${playerName}. Aqui e ${senderName}, da ${placeName}.`,
        "",
        "Sua reserva precisou ser cancelada:",
        `- Quadra: ${courtName}`,
        `- Horario: ${slot}`,
        "",
        alternativesBlock,
        "",
        "Responda por aqui com a melhor opcao para voce, por favor.",
      ].join("\n")
    : [
        `Ola, ${playerName}. Aqui e ${senderName}, da ${placeName}.`,
        "",
        "Precisamos ajustar o horario da sua reserva:",
        `- Quadra: ${courtName}`,
        `- Horario atual: ${slot}`,
        "",
        changeUrl
          ? [
              "Use este link para abrir a agenda atual das quadras, escolher um horario livre e confirmar a alteracao:",
              changeUrl,
              "",
              "A alteracao nao gera uma nova cobrança e mantem a reserva vinculada ao pagamento original.",
            ].join("\n")
          : alternativesBlock,
        "",
        changeUrl ? "Se nenhum horario servir, responda por aqui para combinarmos outra opcao." : "Qual opcao funciona melhor para voce? Assim que voce escolher, atualizamos a reserva no ATP.",
      ].join("\n");

  return whatsappHref(booking.phone, message);
}

export function waitlistWhatsappHref(entry: CourtBookingWaitlistEntry, context: WaitlistWhatsappContext): string {
  const placeName = context.placeName || entry.placeName || "ATP";
  const senderName = context.senderName || "Equipe ATP";
  const playerName = entry.playerName || "jogador";
  const requestedSlot = formatSlot(entry.startsAt, entry.endsAt);
  const requestedCourt = entry.courtName || "Quadra";

  const message = context.promotable
    ? [
        `Ola, ${playerName}. Aqui e ${senderName}, da ${placeName}.`,
        "",
        "O horario que voce aguardava ficou disponivel:",
        `- Quadra: ${requestedCourt}`,
        `- Horario: ${requestedSlot}`,
        "",
        "Para garantir a quadra, finalize a reserva e o pagamento pelo app ou responda por aqui para receber ajuda.",
      ].join("\n")
    : [
        `Ola, ${playerName}. Aqui e ${senderName}, da ${placeName}.`,
        "",
        "O horario que voce solicitou ainda esta ocupado:",
        `- Quadra desejada: ${requestedCourt}`,
        `- Horario desejado: ${requestedSlot}`,
        "",
        context.alternatives.length
          ? alternativesMessageBlock(context.alternatives).replace("Temos estas opcoes proximas:", "Encontramos estas opcoes proximas:")
          : "No momento nao encontramos uma alternativa proxima na agenda carregada. Podemos consultar outro dia ou horario por aqui.",
        "",
        "Qual opcao funciona melhor para voce?",
      ].join("\n");

  return whatsappHref(entry.phone, message);
}
