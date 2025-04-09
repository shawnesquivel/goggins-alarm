# Supabase

## Reset local
npx supabase db reset
npx supabas functions list


## Sync TypeScript to Database Schema
npx supabase gen types --lang=typescript --local > types/database.types.ts