import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const OUT_DIR = path.resolve(ROOT, process.env.ATP_ROLE_AUTH_OUT_DIR || "artifacts/saas-sprint-screens");
const ORIGIN = process.env.ATP_ROLE_AUTH_ORIGIN || "http://127.0.0.1:5180";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://xdopstommqojjofapzjl.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_bofGMq6jhqcVetHTGP6GjQ_vJQWsTjh";

const roles = [
  ["auth-coach.json", "prof.renato@demo.atp.local", process.env.ATP_STAFF_PASSWORD || "Staff@2026!"],
  ["auth-frontdesk.json", "recepcao.dourados@demo.atp.local", process.env.ATP_STAFF_PASSWORD || "Staff@2026!"],
  ["auth-finance.json", "financeiro.prime@demo.atp.local", process.env.ATP_STAFF_PASSWORD || "Staff@2026!"],
  ["auth-cashier.json", "caixa.prime@demo.atp.local", process.env.ATP_STAFF_PASSWORD || "Staff@2026!"],
  ["auth-organizer.json", process.env.ATP_OWNER_EMAIL || "escalao@gmail.com", process.env.ATP_OWNER_PASSWORD || "Escalao@2026!"],
  ["auth-player-pure.json", process.env.ATP_PLAYER_PURE_EMAIL || "jogador002@demo.atp.local", process.env.ATP_PLAYER_PASSWORD || "Jogador@2026!"],
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  for (const [fileName, email, password] of roles) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      throw new Error(`Falha ao autenticar ${email}: ${error?.message || "sessao ausente"}`);
    }
    const storageState = {
      cookies: [],
      origins: [
        {
          origin: ORIGIN,
          localStorage: [
            {
              name: "sb-xdopstommqojjofapzjl-auth-token",
              value: JSON.stringify({
                access_token: data.session.access_token,
                token_type: data.session.token_type,
                expires_in: data.session.expires_in,
                expires_at: data.session.expires_at,
                refresh_token: data.session.refresh_token,
                user: data.session.user,
                weak_password: data.session.weak_password ?? null,
              }),
            },
          ],
        },
      ],
    };
    await writeFile(path.join(OUT_DIR, fileName), JSON.stringify(storageState, null, 2), "utf8");
    console.log(`${fileName}: ${email}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
