# Deep Work Timer App - Testing Guide

This guide will help you set up test data in your database and verify the frontend integration.

## 1. Database Setup

### 1.1 Apply the Initial Schema and Seed Data

The initial schema is defined in `supabase/migrations/20250405050930_initial_schema.sql`, and the test data is in `supabase/seed.sql`.

To apply both:

```bash
# Apply schema migrations and seed data
npx supabase db reset
```

This command will:
1. Run all migrations in the `supabase/migrations` directory
2. Apply the seed data from `supabase/seed.sql`

The seed data populates your database with:
- 3 test users with different profiles
- 5 projects across those users
- Multiple sessions with both work and rest periods
- Different session states including completed and cancelled sessions
- Historical data spanning multiple days 

### 1.2 Seed Data Structure

The seed file first creates entries in `auth.users` to satisfy the foreign key constraints, which was the critical fix needed to make the data insertion work correctly.

## 2. Frontend Testing

### 2.1 Configure Supabase Connection

1. Ensure you have the proper environment variables set in your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Use the appropriate Supabase client for your environment:
   - `lib/supabase.ts` for React Native (mobile)
   - `lib/supabaseClient.js` for web (if needed)

### 2.2 Testing with the Node.js Script

1. Make sure you have the Supabase JavaScript client installed:

```bash
npm install @supabase/supabase-js
```

2. Update `frontend-db-test.js` with your Supabase URL and anon key
3. Run the script:

```bash
node frontend-db-test.js
```

This should output data from each of the test queries, showing:
- List of users
- Projects with associated user emails
- Sessions for the "power user"
- Periods for one of those sessions
- Analytics data from the views

### 2.3 Testing the React Components

To test the React components:

1. Place the component files in your project:
   - `DashboardSummary.jsx` - For viewing session history and stats
   - `CreateDeepWorkSession.jsx` - For creating and managing sessions

2. Import and use them in your app:

```jsx
import DashboardSummary from './DashboardSummary';
import CreateDeepWorkSession from './CreateDeepWorkSession';

// In your app component
function App() {
  const userId = '22222222-2222-2222-2222-222222222222'; // The power user ID
  
  return (
    <div>
      <DashboardSummary userId={userId} />
      <CreateDeepWorkSession userId={userId} />
    </div>
  );
}
```

## 3. Test Use Cases

The seed data is designed to support these test use cases:

### Use Case 1: New User First Session

The user with ID `11111111-1111-1111-1111-111111111111` has completed a single deep work session. Their dashboard should show:
- One project: "App Development"
- One completed session with 30 minutes of deep work
- One 30-minute work period with a quality rating of 4
- One 5-minute rest period with walking and stretching activities

### Use Case 2: Multi-Project User

The user with ID `22222222-2222-2222-2222-222222222222` has multiple projects and sessions across different days. Their dashboard should show:
- Three projects: "Content Creation", "Learning Spanish", and "Side Business"
- Sessions distributed across the past week
- Various work durations and quality ratings
- Different rest activities

### Use Case 3: Interrupted Sessions

The user with ID `33333333-3333-3333-3333-333333333333` has one cancelled session and one completed session. Their dashboard should show:
- The "Thesis Writing" project
- One cancelled session with distractions listed
- One completed session with the same task that followed the interrupted one

## 4. Troubleshooting

If you encounter issues:

1. Check the database connection by running simple queries in the Supabase dashboard
2. Verify RLS policies are correctly configured to allow access to the test data
3. Check browser console for any errors with the Supabase client
4. Ensure the UUID values in your code match those in the seed data

## 5. Next Steps

Once basic frontend testing is working:

1. Implement authentication to create real user sessions
2. Add form validation in the CreateDeepWorkSession component
3. Add styling to match your application design
4. Implement analytics charts using the data from the views 