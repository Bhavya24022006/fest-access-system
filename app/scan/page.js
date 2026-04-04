"use client";

import { useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, get, update } from "firebase/database";

export default function ScanPage() {
  const scannerRef = useRef(null);
  const hasScanned = useRef(false);

  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  // 🔥 prevent server-side execution
  if (typeof window === "undefined") {
    return null;
  }

  const startScanner = async () => {
    try {
      hasScanned.current = false;

      const { Html5Qrcode } = await import("html5-qrcode");

      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      setScanning(true);
      setResult(null);

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },

        async (decodedText) => {
          if (hasScanned.current) return;
          hasScanned.current = true;

          let cleanText = decodedText?.trim();

          if (!cleanText || !cleanText.includes(":")) {
            setResult({
              status: "invalid",
              message: "Invalid QR format",
            });
            return;
          }

          const [id, token] = cleanText.split(":");

          if (!id || !token) {
            setResult({
              status: "invalid",
              message: "Corrupted QR",
            });
            return;
          }

          setResult({ status: "scanned" });

          try {
            const passRef = ref(db, "passes/" + id);
            const snapshot = await get(passRef);

            if (snapshot.exists()) {
              const data = snapshot.val();

              // 🔐 Token validation
              if (data.token !== token) {
                setResult({
                  status: "invalid",
                  message: "QR tampered",
                });
                return;
              }

              // 🔁 Already used
              if (data.used) {
                setResult({
                  status: "used",
                  name: data.name,
                  photo: data.photo,
                });
              } else {
                await update(passRef, { used: true });

                setResult({
                  status: "allowed",
                  name: data.name,
                  photo: data.photo,
                });
              }
            } else {
              setResult({
                status: "invalid",
                message: "Pass not found",
              });
            }
          } catch (err) {
            console.error(err);
            setResult({
              status: "error",
              message: err.message,
            });
          }

          await html5QrCode.stop();
          setScanning(false);

          setTimeout(() => {
            setResult(null);
            hasScanned.current = false;
          }, 3000);
        }
      );
    } catch (err) {
      console.error(err);
      setResult({
        status: "error",
        message: err.message,
      });
      setScanning(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>🎟 Scan Entry Pass</h1>

      {/* RESULT BOX */}
      {result && (
        <div
          style={{
            padding: "15px",
            marginBottom: "20px",
            borderRadius: "10px",
            textAlign: "center",
            width: "300px",
            background:
              result.status === "allowed"
                ? "#16a34a"
                : result.status === "used"
                ? "#f59e0b"
                : result.status === "invalid"
                ? "#dc2626"
                : "#2563eb",
          }}
        >
          <p><b>Status:</b> {result.status}</p>
          {result.name && <p>{result.name}</p>}
          {result.message && <p>{result.message}</p>}

          {result.photo && (
            <img
              src={result.photo}
              alt="User"
              style={{
                width: "120px",
                borderRadius: "10px",
                marginTop: "10px",
              }}
            />
          )}
        </div>
      )}

      {/* START BUTTON */}
      {!scanning && !result && (
        <button
          onClick={startScanner}
          style={{
            padding: "12px 25px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "none",
            background: "#22c55e",
            color: "white",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          Start Scanning
        </button>
      )}

      {/* CAMERA BOX */}
      <div
        id="reader"
        style={{
          width: "320px",
          borderRadius: "12px",
          overflow: "hidden",
          border: "2px solid #22c55e",
        }}
      ></div>
    </div>
  );
}