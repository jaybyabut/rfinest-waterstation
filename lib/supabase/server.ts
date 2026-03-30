import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have proxy refreshing
            // user sessions.
          }
        },
      },
    },
  );
}

/**
 * Ensures the user is authenticated and returns the supabase client and user data.
 * Throws an error if not authenticated.
 */
export async function ensureAuthenticated() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error("Unauthorized: Please log in.");
  }
  return { supabase, user };
}

/**
 * Ensures the user has one of the allowed roles (or is an admin).
 * Throws an error if not authenticated or role is not permitted.
 */
export async function ensureRole(allowedRoles: string[]) {
  const { supabase, user } = await ensureAuthenticated();
  const role = user.app_metadata?.role || 
               user.app_metadata?.user_role || 
               user.user_metadata?.role || 
               user.user_metadata?.user_role;

  // Admin is a superuser and bypassed semua checks
  if (role === 'admin') return { supabase, user, role };

  if (!role || !allowedRoles.includes(role)) {
    throw new Error(`Unauthorized: Role '${role || 'None'}' not permitted.`);
  }
  return { supabase, user, role };
}

export async function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    },
  );
}
