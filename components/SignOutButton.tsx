"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton({ label }: { label: string }) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await authClient.signOut();
        router.push("/acceso");
        router.refresh();
      }}
      className="border border-line text-muted hover:border-gold hover:text-gold text-[13px] px-4 py-2 rounded-full"
    >
      {label}
    </button>
  );
}
