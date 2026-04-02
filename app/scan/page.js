"use client";

import { useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, get, update } from "firebase/database";

export default function ScanPage() {
  const scannerRef = useRef(null);
  const hasScanned = useRef(false);

  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

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

          // SAFETY CHECK
          if (!cleanText) {
            setResult({
              status: "error",
              message: "Empty QR value"
            });
            return;
          }

          // JSON QR support
          if (cleanText.startsWith("{")) {
            try {
              const obj = JSON.parse(cleanText);
              cleanText = obj.id;
            } catch {}
          }

          // URL QR support
          if (cleanText.includes("id=")) {
            cleanText = cleanText.split("id=")[1];
          }

          // REMOVE INVALID FIREBASE CHARS
          cleanText = cleanText.replace(/[.#$[\]/]/g, "");

          console.log("FINAL VALUE:", cleanText);

          setResult({
            status: "scanned",
            raw: cleanText
          });

          try {
            const passRef = ref(db, "passes/" + cleanText);
            const snapshot = await get(passRef);

            console.log("DB RESULT:", snapshot.val());

            if (snapshot.exists()) {
              const data = snapshot.val();

              if (data.used) {
                setResult({
                  status: "used",
                  name: data.name,
                  raw: cleanText
                });
              } else {
                await update(passRef, { used: true });

                setResult({
                  status: "allowed",
                  name: data.name,
                  raw: cleanText
                });
              }
            } else {
              setResult({
                status: "invalid",
                raw: cleanText
              });
            }

          } catch (err) {
            console.error("ERROR:", err);

            setResult({
              status: "error",
              message: err.message,
              raw: cleanText
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
      console.error("START ERROR:", err);

      setResult({
        status: "error",
        message: err.message
      });

      setScanning(false);
    }
  };

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h1>Scan QR</h1>

      {result && (
        <div
          style={{
            padding: "20px",
            marginBottom: "20px",
            color: "white",
            fontSize: "18px",
            background:
              result.status === "allowed"
                ? "green"
                : result.status === "used"
                ? "orange"
                : result.status === "invalid"
                ? "red"
                : result.status === "scanned"
                ? "blue"
                : "black",
          }}
        >
          <p>Status: {result.status}</p>

          {result.raw && <p>QR: {result.raw}</p>}
          {result.name && <p>Name: {result.name}</p>}
          {result.message && <p>Error: {result.message}</p>}
        </div>
      )}

      {!scanning && !result && (
        <button
          onClick={startScanner}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          Start Scanning
        </button>
      )}

      <div
        id="reader"
        style={{ width: "300px", margin: "20px auto" }}
      ></div>
    </div>
  );
}