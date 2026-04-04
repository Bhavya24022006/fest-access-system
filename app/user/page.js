"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { QRCodeCanvas } from "qrcode.react";

export default function UserPage() {
  const [passes, setPasses] = useState([]);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const snapshot = await get(ref(db, "passes"));

      const userPasses = [];

      snapshot.forEach((child) => {
        if (child.val().userId === user.uid) {
          userPasses.push(child.val());
        }
      });

      setPasses(userPasses);
    });
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "30px",
        textAlign: "center",
      }}
    >
      <h1 style={{ marginBottom: "30px" }}>🎟 Your Passes</h1>

      {passes.length === 0 && <p>No passes found</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {passes.map((pass) => (
          <div
            key={pass.id}
            style={{
              background: "#1e293b",
              padding: "20px",
              borderRadius: "12px",
            }}
          >
            <p style={{ fontSize: "18px", fontWeight: "bold" }}>
              {pass.event}
            </p>

            <div
              style={{
                marginTop: "15px",
                padding: "20px",
                background: "white",
                borderRadius: "12px",
                display: "inline-block",
              }}
            >
              <QRCodeCanvas
                value={`${pass.id}:${pass.token}`}
                size={220}
              />
            </div>

            <p style={{ marginTop: "10px" }}>
              Status:{" "}
              <span style={{ color: pass.used ? "#f59e0b" : "#22c55e" }}>
                {pass.used ? "Used" : "Active"}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}