import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

const TABLE_USER_FOLLOWS = "user_follows";

export async function listFollowingIds(user: User, candidateIds: string[]): Promise<Set<string>> {
  if (!supabase) return new Set();
  const ids = Array.from(new Set(candidateIds.filter((id) => id && id !== user.id)));
  if (!ids.length) return new Set();
  const { data, error } = await supabase
    .from(TABLE_USER_FOLLOWS)
    .select("following_id")
    .eq("follower_id", user.id)
    .in("following_id", ids);
  if (error) throw new Error(error.message);
  return new Set(((data ?? []) as { following_id: string }[]).map((row) => row.following_id));
}

export async function followUser(user: User, followingId: string): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  if (!followingId || followingId === user.id) return;
  const { error } = await supabase
    .from(TABLE_USER_FOLLOWS)
    .upsert({ follower_id: user.id, following_id: followingId }, { onConflict: "follower_id,following_id" });
  if (error) throw new Error(error.message);
}

export async function unfollowUser(user: User, followingId: string): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase
    .from(TABLE_USER_FOLLOWS)
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", followingId);
  if (error) throw new Error(error.message);
}
