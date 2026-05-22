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
  profile_visibility?: "public" | "private" | null;
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
    profileVisibility: row.profile_visibility === "private" ? "private" : "public",
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
    profileVisibility: "public",
  };
}

export async function fetchProfile(user: User): Promise<Profile> {
  if (!supabase) return emptyProfile(user.id);
  const { data, error } = await supabase
    .from(TABLE)
    .select("user_id,display_name,photo_url,city,state,phone,birth_date,instagram,bio,profile_visibility")
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
  const { data, error } = await supabase.rpc("app_get_public_profiles", { p_user_ids: ids });
  if (error) throw new Error(error.message);
  for (const row of (data ?? []) as ProfileRow[]) {
    result.set(row.user_id, rowToProfile(row));
  }
  return result;
}

export async function fetchPublicProfile(userId: string): Promise<Profile | null> {
  const profiles = await fetchPublicProfiles([userId]);
  return profiles.get(userId) ?? null;
}

export async function fetchPrivatePlayerNote(user: User, targetUserId: string): Promise<string> {
  if (!supabase || !targetUserId || targetUserId === user.id) return "";
  const { data, error } = await supabase
    .from("player_private_notes")
    .select("notes")
    .eq("owner_user_id", user.id)
    .eq("target_user_id", targetUserId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return typeof data?.notes === "string" ? data.notes : "";
}

export async function savePrivatePlayerNote(user: User, targetUserId: string, notes: string): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  if (!targetUserId || targetUserId === user.id) return;
  const { error } = await supabase
    .from("player_private_notes")
    .upsert(
      {
        owner_user_id: user.id,
        target_user_id: targetUserId,
        notes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "owner_user_id,target_user_id" }
    );
  if (error) throw new Error(error.message);
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
    profile_visibility: patch.profileVisibility ?? "public",
  };
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: "user_id" })
    .select("user_id,display_name,photo_url,city,state,phone,birth_date,instagram,bio,profile_visibility")
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
