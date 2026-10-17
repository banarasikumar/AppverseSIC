# AppverseSI contact inbox database

1. Create a Supabase project.
2. Open the project's SQL Editor and run the migration in supabase/migrations/20261017000000_contact_messages.sql.
3. In Vercel, add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to the Production environment for the appverse-sic project. The service-role key must remain server-side and must never use a NEXT_PUBLIC_ prefix.
4. Also set ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET in Production. Choose a unique strong password and a random secret of at least 32 characters. Store secrets only in Vercel's encrypted environment-variable settings.
5. Redeploy the project, then add admin.appverse.si as a domain on the same Vercel project.

The contact form writes directly to the database, so message storage does not depend on Resend or email delivery. The dashboard lets the admin review messages, search the inbox, mark messages read or unread, archive them, and reply using the visitor's mail client. Only authenticated admin routes can use the service-role key.

Supabase SQL editor migration location: supabase/migrations/20261017000000_contact_messages.sql
