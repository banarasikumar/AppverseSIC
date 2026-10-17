import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, isValidAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminIndexPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  redirect(isValidAdminSession(token) ? "/admin/dashboard" : "/admin/login");
}
