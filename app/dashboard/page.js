"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const snapshot = await get(ref(db, "users/" + user.uid));

      if (snapshot.exists()) {
        const data = snapshot.val();

        if (data.role !== "admin") {
          router.push("/login");
        } else {
          setLoading(false);
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <h1>Checking access...</h1>;
  }

  return <h1>Welcome Admin </h1>;
}