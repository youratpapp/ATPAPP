import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { ScreenState } from "../components/ScreenState";
import { friendlyToastMessage } from "../components/toast";
import { listAcademyClassesByIds, listMyAcademyEnrollments, listPlaceAcademyClasses, listAllPlaces } from "../lib/places";
import type { AcademyClass, AcademyEnrollment, Place, Profile } from "../lib/types";

type Props = {
  user: User;
  profile: Profile | null;
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function classSchedule(academyClass?: AcademyClass): string {
  if (!academyClass) return "Horario a confirmar";
  return `${WEEKDAYS[academyClass.weekday] || "Dia"} ${academyClass.startsAt.slice(0, 5)}-${academyClass.endsAt.slice(0, 5)}`;
}

export function MyLessonsPage({ user, profile }: Props) {
  const [enrollments, setEnrollments] = useState<AcademyEnrollment[]>([]);
  const [classesById, setClassesById] = useState<Record<string, AcademyClass>>({});
  const [placesById, setPlacesById] = useState<Record<string, Place>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const active = useMemo(() => enrollments.filter((item) => item.status !== "cancelled"), [enrollments]);
  const pending = useMemo(() => active.filter((item) => item.status === "pending"), [active]);
  const confirmed = useMemo(() => active.filter((item) => item.status === "active"), [active]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [myEnrollments, places] = await Promise.all([listMyAcademyEnrollments(), listAllPlaces(user).catch(() => [] as Place[])]);
      setEnrollments(myEnrollments);
      setPlacesById(Object.fromEntries(places.map((place) => [place.id, place])));
      const placeIds = Array.from(new Set(myEnrollments.map((item) => item.placeId)));
      const classLists = await Promise.all(placeIds.map((placeId) => listPlaceAcademyClasses(placeId).catch(() => [] as AcademyClass[])));
      const loadedClasses = classLists.flat();
      const loadedClassIds = new Set(loadedClasses.map((academyClass) => academyClass.id));
      const missingLinkedClassIds = myEnrollments
        .map((enrollment) => enrollment.classId)
        .filter((classId) => classId && !loadedClassIds.has(classId));
      const linkedClasses = missingLinkedClassIds.length
        ? await listAcademyClassesByIds(missingLinkedClassIds).catch(() => [] as AcademyClass[])
        : [];
      const classMap: Record<string, AcademyClass> = {};
      [...loadedClasses, ...linkedClasses].forEach((academyClass) => {
        classMap[academyClass.id] = academyClass;
      });
      setClassesById(classMap);
    } catch (err) {
      setError(friendlyToastMessage(err, "Nao foi possivel carregar suas aulas."));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const renderEnrollment = (enrollment: AcademyEnrollment) => {
    const academyClass = classesById[enrollment.classId];
    const place = placesById[enrollment.placeId];
    const statusLabel = !academyClass
      ? "Turma a ajustar"
      : academyClass.isActive
        ? enrollment.status === "active" ? "Matriculado" : "Aguardando"
        : "Turma pausada";
    const statusTone = academyClass && academyClass.isActive && enrollment.status === "active" ? "ok" : "pending";
    return (
      <article key={enrollment.id} className="personal-area-row static">
        <span>
          <strong>{academyClass?.title || "Matricula sem turma ativa"}</strong>
          <small>{place?.name || "Academia"} | {classSchedule(academyClass)} | {academyClass?.coachName || "Professor a confirmar"}</small>
        </span>
        <em className={`status-pill tone-${statusTone}`}>{statusLabel}</em>
      </article>
    );
  };

  return (
    <AppShell user={user} profile={profile} mode="player">
      <main className="page personal-area-page">
        <header className="personal-area-header">
          <span>Aulas</span>
          <h1>Minhas aulas</h1>
          <p>Turmas, professores, horarios e solicitacoes de matricula em um lugar leve.</p>
        </header>
        {loading ? <ScreenState kind="loading" title="Carregando aulas..." /> : null}
        {error ? (
          <ScreenState
            kind="error"
            title="Nao foi possivel carregar"
            detail={error}
            action={<button className="secondary" onClick={() => void load()}>Tentar novamente</button>}
          />
        ) : null}
        {!loading && !error && !active.length ? (
          <ScreenState
            title="Voce ainda nao tem aulas"
            detail="Entre em uma turma para acompanhar seu calendario por aqui."
            action={<Link className="button-like primary" to="/locais?intent=classes">Encontrar aulas</Link>}
          />
        ) : null}
        {!loading && !error && active.length ? (
          <div className="personal-area-grid">
            <section className="personal-area-card">
              <header><div><span>Confirmadas</span><h2>Turmas ativas</h2></div><b>{confirmed.length}</b></header>
              {confirmed.length ? confirmed.map(renderEnrollment) : <p className="subtle">Nenhuma turma ativa.</p>}
            </section>
            <section className="personal-area-card">
              <header><div><span>Solicitacoes</span><h2>Aguardando academia</h2></div><b>{pending.length}</b></header>
              {pending.length ? pending.map(renderEnrollment) : <p className="subtle">Nada pendente.</p>}
            </section>
          </div>
        ) : null}
      </main>
    </AppShell>
  );
}
