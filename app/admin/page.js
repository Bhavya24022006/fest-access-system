"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { QRCodeCanvas } from "qrcode.react";

export default function AdminPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [event, setEvent] = useState("");
  const [passes, setPasses] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [userExists, setUserExists] = useState(false);

  // 🔍 CHECK USER
  const checkUser = async (email) => {
    try {
      if (!email.includes("@")) return;

      const res = await fetch(`/api/checkUser?email=${email}`);
      const data = await res.json();

      console.log("checkUser:", data);

      if (data.exists) {
        setName(data.name);
        setUserExists(true);

        if (data.photo) {
          setPhoto(data.photo);
        }

      } else {
        setUserExists(false);
        setName("");
        setPhoto(null);
      }

    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 Convert image → base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // 🎟 CREATE PASS
  const createPass = async () => {
    try {
      let base64Image = "";

      if (!userExists && photo) {
        base64Image = await convertToBase64(photo);
      }

      const res = await fetch("/api/createUserAndPass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          event,
          photo: base64Image || photo || "", // 🔥 handles both cases
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Pass created successfully 🎉");
      } else {
        alert(data.error || "Something went wrong");
      }

      setName("");
      setEmail("");
      setEvent("");
      setPhoto(null);
      setUserExists(false);

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  // 🔄 FETCH PASSES
  useEffect(() => {
    const passesRef = ref(db, "passes");

    const unsubscribe = onValue(passesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        const passList = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));

        setPasses(passList);
      } else {
        setPasses([]);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "30px",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        🎟 Admin Dashboard
      </h1>

      {/* FORM */}
      <div
        style={{
          background: "#1e293b",
          padding: "20px",
          borderRadius: "12px",
          maxWidth: "400px",
          margin: "auto",
          marginBottom: "40px",
        }}
      >
        <h2>Create Pass</h2>

        {/* EMAIL */}
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => checkUser(email)}
          style={inputStyle}
        />

        {/* NAME */}
        <input
          placeholder="Name"
          value={name}
          disabled={userExists}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        {/* EVENT */}
        <input
          placeholder="Event"
          value={event}
          onChange={(e) => setEvent(e.target.value)}
          style={inputStyle}
        />

        {/* PHOTO SECTION */}
        {userExists ? (
          <div style={{ marginTop: "10px", textAlign: "center" }}>
            <p style={{ color: "#22c55e" }}>✔ Existing user</p>

            {photo && (
              <img
                src={photo}
                alt="user"
                style={{
                  width: "100px",
                  borderRadius: "10px",
                  marginTop: "10px",
                }}
              />
            )}
          </div>
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
            style={{ marginTop: "10px", color: "white" }}
          />
        )}

        <button onClick={createPass} style={buttonStyle}>
          Create Pass
        </button>
      </div>

      {/* PASSES */}
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        All Passes
      </h2>

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
              textAlign: "center",
            }}
          >
            <p><b>{pass.name}</b></p>
            <p>{pass.email}</p>
            <p>{pass.event}</p>

            <p>
              Status:{" "}
              <span style={{ color: pass.used ? "#f59e0b" : "#22c55e" }}>
                {pass.used ? "Used" : "Not Used"}
              </span>
            </p>

            {pass.photo && (
              <img
                src={pass.photo}
                alt="user"
                style={{
                  width: "100px",
                  borderRadius: "10px",
                  margin: "10px auto",
                }}
              />
            )}

            <div
              style={{
                marginTop: "15px",
                padding: "15px",
                background: "white",
                borderRadius: "10px",
                display: "inline-block",
              }}
            >
              <QRCodeCanvas
                value={`${pass.id}:${pass.token}`}
                size={220}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// styles
const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "10px",
  borderRadius: "6px",
  border: "none",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "15px",
  background: "#22c55e",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};