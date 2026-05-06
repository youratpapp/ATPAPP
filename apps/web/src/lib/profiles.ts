import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { Profile } from "./types";

const TABLE = "profiles";

type ProfileRow = {
  user_id: string;
  display_name: string | null;
  photo_url: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  birth_date: string | null;
  instagram: string | null;
  bio: string | null;
};

function rowToProfile(row: ProfileRow): Profile {
  return {
    userId: row.user_id,
    displayName: row.display_name ?? "",
    photoUrl: row.photo_url ?? "",
    city: row.city ?? "",
    state: row.state ?? "",
    phone: row.phone ?? "",
    birthDate: row.birth_date ?? "",
    instagram: row.instagram ?? "",
    bio: row.bio ?? "",
  };
}

function emptyProfile(userId: string): Profile {
  return {
    userId,
    displayName: "",
    photoUrl: "",
    city: "",
    state: "",
    phone: "",
    birthDate: "",
    instagram: "",
    bio: "",
  };
}

export async function fetchProfile(user: User): Promise<Profile> {
  if (!supabase) return emptyProfile(user.id);
  const { data, error } = await supabase
    .from(TABLE)
    .select("user_id,display_name,photo_url,city,state,phone,birth_date,instagram,bio")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return emptyProfile(user.id);
  return rowToProfile(data as ProfileRow);
}

export async function fetchPublicProfiles(userIds: string[]): Promise<Map<string, Profile>> {
  const result = new Map<string, Profile>();
  if (!supabase || userIds.length === 0) return result;
  const ids = Array.from(new Set(userIds.filter(Boolean)));
  if (ids.length === 0) return result;
  const { data, error } = await supabase
    .from(TABLE)
    .select("user_id,display_name,photo_url,city,state,phone,birth_date,instagram,bio")
    .in("user_id", ids);
  if (error) throw new Error(error.message);
  for (const row of (data ?? []) as ProfileRow[]) {
    result.set(row.user_id, rowToProfile(row));
  }
  return result;
}

export async function upsertProfile(user: User, patch: Partial<Profile>): Promise<Profile> {
  if (!supabase) throw new Error("Supabase não configurado.");
  const payload = {
    user_id: user.id,
    display_name: patch.displayName ?? null,
    photo_url: patch.photoUrl ?? null,
    city: patch.city ?? null,
    state: patch.state ?? null,
    phone: patch.phone ?? null,
    birth_date: patch.birthDate || null,
    instagram: patch.instagram ?? null,
    bio: patch.bio ?? null,
  };
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: "user_id" })
    .select("user_id,display_name,photo_url,city,state,phone,birth_date,instagram,bio")
    .single();
  if (error) throw new Error(error.message);
  return rowToProfile(data as ProfileRow);
}

export async function uploadAvatar(user: User, file: File): Promise<string> {
  if (!supabase) throw new Error("Supabase não configurado.");
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/avatar-${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });
  if (upErr) throw new Error(upErr.message);
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}
