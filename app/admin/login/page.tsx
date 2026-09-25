import type { Metadata } from "next";

import AdminLoginForm from "../../../components/auth/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login | Seven Bucks Nutrition",
  description:
    "Seven Bucks Nutrition administrator portal.",
};

export default function AdminLoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#e9e5dc] px-4 py-8 text-[#171512] sm:px-8 sm:py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />
        <div className="absolute bottom-[-160px] left-[-100px] h-[360px] w-[360px] rounded-full bg-[#a27d37]/[0.07] blur-3xl" />
        <div className="absolute right-[-120px] top-1/3 h-[360px] w-[360px] rounded-full bg-white/50 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl items-center justify-center sm:min-h-[calc(100vh-96px)]">
        <AdminLoginForm />
      </div>
    </main>
  );
}