"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Session } from "@supabase/supabase-js";

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Force redirect away from the login page so it never renders
  useEffect(() => {
    router.replace("/");
  }, [router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const syncSessionToServer = async (
    event: "SIGNED_IN" | "SIGNED_OUT",
    session?: Session | null
  ) => {
    await fetch("/api/auth/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, session: session ?? null }),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      // Supabase は 400 エラーとして返す
      setErrorMsg(error.message || "ログインに失敗しました");
      return;
    }

    await syncSessionToServer("SIGNED_IN", data.session);

    // ログイン成功 → トップページへ
    router.push("/");
    router.refresh();
  };

  return null;
}
