import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { Place } from "./types";

const TABLE_PLACES = "places";
const TABLE_FOLLOWERS = "place_followers";

type PlaceRow = {
  id: string;
  owner_id: string;
  name: string;
  city: string | null;
  state: string | null;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
};

function rowToPlace(row: PlaceRow, followerCount = 0, isFollowing = false): Place {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    city: row.city ?? "",
    state: row.state ?? "",
    description: row.description ?? "",
    logoUrl: row.logo_url ?? "",
    coverUrl: row.cover_url ?? "",
    followerCount,
    isFollowing,
  };
}

async function decoratePlaces(rows: PlaceRow[], userId: string): Promise<Place[]> {
  if (!supabase || rows.length === 0) {
    return rows.map((r) => rowToPlace(r));
  }
  const ids = rows.map((r) => r.id);

  // Contagem de seguidores por local
  const counts = new Map<string, number>();
  const { data: followerRows, error: fErr } = await supabase
    .from(TABLE_FOLLOWERS)
    .select("place_id,user_id")
    .in("place_id", ids);
  if (fErr) throw new Error(fErr.message);

  const myFollows = new Set<string>();
  for (const row of (followerRows ?? []) as { place_id: string; user_id: string }[]) {
    counts.set(row.place_id, (counts.get(row.place_id) ?? 0) + 1);
    if (row.user_id === userId) myFollows.add(row.place_id);
  }

  return rows.map((r) => rowToPlace(r, counts.get(r.id) ?? 0, myFollows.has(r.id)));
}

export async function listAllPlaces(user: User): Promise<Place[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_PLACES)
    .select("id,owner_id,name,city,state,description,logo_url,cover_url")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return decoratePlaces((data ?? []) as PlaceRow[], user.id);
}

export async function listPlacesIOwn(user: User): Promise<Place[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_PLACES)
    .select("id,owner_id,name,city,state,description,logo_url,cover_url")
    .eq("owner_id", user.id)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return decoratePlaces((data ?? []) as PlaceRow[], user.id);
}

export async function listPlacesIFollow(user: User): Promise<Place[]> {
  if (!supabase) return [];
  const { data: follows, error: fErr } = await supabase
    .from(TABLE_FOLLOWERS)
    .select("place_id")
    .eq("user_id", user.id);
  if (fErr) throw new Error(fErr.message);
  const ids = ((follows ?? []) as { place_id: string }[]).map((r) => r.place_id);
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from(TABLE_PLACES)
    .select("id,owner_id,name,city,state,description,logo_url,cover_url")
    .in("id", ids)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return decoratePlaces((data ?? []) as PlaceRow[], user.id);
}

export async function createPlace(
  user: User,
  input: { name: string; city?: string; state?: string; description?: string; logoUrl?: string }
): Promise<Place> {
  if (!supabase) throw new Error("Supabase não configurado.");
  const payload = {
    owner_id: user.id,
    name: input.name.trim(),
    city: input.city?.trim() || null,
    state: (input.state?.trim() || "").toUpperCase().slice(0, 2) || null,
    description: input.description?.trim() || null,
    logo_url: input.logoUrl || null,
  };
  const { data, error } = await supabase
    .from(TABLE_PLACES)
    .insert(payload)
    .select("id,owner_id,name,city,state,description,logo_url,cover_url")
    .single();
  if (error) throw new Error(error.message);
  return rowToPlace(data as PlaceRow);
}

export async function followPlace(user: User, placeId: string): Promise<void> {
  if (!supabase) throw new Error("Supabase não configurado.");
  const { error } = await supabase
    .from(TABLE_FOLLOWERS)
    .upsert({ place_id: placeId, user_id: user.id }, { onConflict: "place_id,user_id" });
  if (error) throw new Error(error.message);
}

export async function unfollowPlace(user: User, placeId: string): Promise<void> {
  if (!supabase) throw new Error("Supabase não configurado.");
  const { error } = await supabase
    .from(TABLE_FOLLOWERS)
    .delete()
    .eq("place_id", placeId)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
}

export async function uploadPlaceLogo(user: User, file: File): Promise<string> {
  if (!supabase) throw new Error("Supabase não configurado.");
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/logo-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("places")
    .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("places").getPublicUrl(path);
  return data.publicUrl;
}
