"use client";

import { usePathname } from "next/navigation";

import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import CartProvider from "../cart/CartProvider";

export function StorefrontShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAdminRoute =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  const isAuthRoute =
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/register" ||
    pathname.startsWith("/register/");

  if (isAdminRoute || isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <CartProvider>
      <Navbar />

      {children}

      <Footer />
    </CartProvider>
  );
}