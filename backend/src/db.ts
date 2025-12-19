import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const sql = postgres(process.env.DB_URL!, {
  ssl: "require",
});

export const db = drizzle(sql);

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY!
);

export const uploadLootImage = async (file: File) => {
  const fileName = `${crypto.randomUUID()}.png`;

  const { data, error } = await supabase.storage
    .from("loot-images")
    .upload(fileName, file, {
      contentType: file.type,
    });

  if (error) throw error;

  const { data: publicUrl } = supabase.storage
    .from("loot-images")
    .getPublicUrl(fileName);

  return publicUrl.publicUrl;
};
