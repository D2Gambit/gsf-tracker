import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { createClient } from '@supabase/supabase-js'

const db_url = ''
const supabase_url = ''
const service_role_key = '' // Replace with your actual service role key


// process.env.DATABASE_URL!
const sql = postgres(db_url, {
  ssl: 'require'
})

export const db = drizzle(sql)

export const supabase = createClient(
  supabase_url,
  service_role_key,
)

export const uploadLootImage = async (file: File) => {
  const fileName = `${crypto.randomUUID()}.png`

  const { data, error } = await supabase.storage
    .from('loot-images')
    .upload(fileName, file, {
      contentType: file.type
    })

  if (error) throw error

  const { data: publicUrl } = supabase.storage
    .from('loot-images')
    .getPublicUrl(fileName)

  return publicUrl.publicUrl
}