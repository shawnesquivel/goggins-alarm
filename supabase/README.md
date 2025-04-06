# Supabase Integration for Deep Work Timer

This directory contains Supabase configurations, database migrations, and serverless functions for the Deep Work Timer app.

## Structure

- `migrations/`: SQL migrations for the database schema
- `functions/`: Edge Functions for serverless functionality
- `config.toml`: Supabase project configuration

## Database Schema

We're using the Unified Period Table approach as described in the database design document. The schema includes:

- `users`: User profiles linked to Supabase Auth
- `projects`: Projects that users can create for their deep work sessions
- `sessions`: Individual deep work sessions
- `periods`: Unified table for both work and rest periods
- `webhook_logs`: Logs of RevenueCat subscription events

## Edge Functions

- `handle-revenuecat-webhook`: Processes subscription events from RevenueCat

## Development

### Prerequisites

- Supabase CLI installed (`npm install -g supabase`)
- Linked to the project (`supabase link --project-ref your-project-ref`)

### Local Development

```bash
# Start local Supabase dev environment
npx supabase start

# Generate database types
npx supabase gen types typescript --local > lib/database.types.ts

# Deploy Edge Functions
npx supabase functions deploy handle-revenuecat-webhook
```

### Database Migrations

```bash
# Apply migrations
npx supabase db push

# Create a new migration
npx supabase migration new your_migration_name
```

## Environment Variables

Make sure these are set in your app:

```
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

For Edge Functions, the required environment variables are:

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
``` 