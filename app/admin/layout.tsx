"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminDashboardLayout from "./AdminDashboardLayout";
import { supabase } from "../../lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    let mounted = true;

    async function checkAdminAccess() {
      // Login page should remain publicly accessible.
      if (isLoginPage) {
        if (mounted) {
          setChecking(false);
          setIsAdmin(false);
        }
        return;
      }

      setChecking(true);

      try {
        /*
         * First verify that a real authenticated
         * Supabase user exists.
         */
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          if (mounted) {
            setIsAdmin(false);
            setChecking(false);
          }

          router.replace("/admin/login");
          return;
        }

        /*
         * Then verify the user's role and active status.
         */
        const { data: customer, error: roleError } =
          await supabase
            .from("customers")
            .select("role, is_active")
            .eq("id", user.id)
            .maybeSingle();

        if (
          roleError ||
          !customer ||
          customer.role !== "admin" ||
          !customer.is_active
        ) {
          await supabase.auth.signOut();

          if (mounted) {
            setIsAdmin(false);
            setChecking(false);
          }

          router.replace("/admin/login");
          return;
        }

        /*
         * User is authenticated + active + admin.
         */
        if (mounted) {
          setIsAdmin(true);
          setChecking(false);
        }
      } catch (error) {
        console.error("Admin access check failed:", error);

        if (mounted) {
          setIsAdmin(false);
          setChecking(false);
        }

        router.replace("/admin/login");
      }
    }

    checkAdminAccess();

    return () => {
      mounted = false;
    };
  }, [isLoginPage, router]);

  /*
   * Admin login page stays completely clean.
   */
  if (isLoginPage) {
    return <>{children}</>;
  }

  /*
   * Don't render admin pages while access is being verified.
   */
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f2eb]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-[#171512]" />

          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/40">
            Verifying administrator access...
          </p>
        </div>
      </div>
    );
  }

  /*
   * If verification failed, don't render protected content.
   */
  if (!isAdmin) {
    return null;
  }

  return (
    <AdminDashboardLayout>
      {children}
    </AdminDashboardLayout>
  );
}