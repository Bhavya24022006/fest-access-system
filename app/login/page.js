"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, db } from "@/lib/firebase";

export default function LoginPage() {
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  const [email, setEmail] = useState("admin@test.com");
const [password, setPassword] = useState("123456");

  const handleLogin = async () => {
     console.log("Login function started");
     console.log("Trying login with:", email, password);
    try {
      const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = result.user;

     
      const snapshot = await get(ref(db, "users/" + user.uid));

      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log("User Data:", data);

         
        if (data.role === "admin") {
          window.location.href = "/dashboard";
        } else {
          alert("Access denied: Not admin");
        }
      } else {
        alert("No user data found in database");
      }

    } catch (error) {
      console.error("FULL ERROR:", error);
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Login Page</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}