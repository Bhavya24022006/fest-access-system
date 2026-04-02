"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, push, set, onValue } from "firebase/database";
import { QRCodeCanvas } from "qrcode.react";


export default function AdminPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [event, setEvent] = useState("");
  const [passes, setPasses] = useState([]);
 
  
  const createPass = async () => {
    try {
      const newRef = push(ref(db, "passes")); 

      await set(newRef, {
        id: newRef.key, 
        name: name,
        email: email,
        event: event,
        used: false
      });

      alert("Pass created");

      setName("");
      setEmail("");
      setEvent("");
    } catch (error) {
      console.error(error);
      alert("Error creating pass");
    }
  };

  
  useEffect(() => {
    const passesRef = ref(db, "passes");

    const unsubscribe = onValue(passesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        const passList = Object.entries(data).map(([id, value]) => ({
          id,
          ...value
        }));

        setPasses(passList);
      } else {
        setPasses([]);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Create Pass</h1>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Event"
        value={event}
        onChange={(e) => setEvent(e.target.value)}
      />
      <br /><br />

      <button onClick={createPass}>Create Pass</button>

      <hr />

      <h2>All Passes</h2>

      {passes.map((pass) => (
        <div
          key={pass.id}
          style={{
            border: "1px solid black",
            margin: 10,
            padding: 10
          }}
        >
          <p>Name: {pass.name}</p>
          <p>Email: {pass.email}</p>
          <p>Event: {pass.event}</p>
          <p>Status: {pass.used ? "Used" : "Not Used"}</p>

        

          <QRCodeCanvas 
          value={pass.id} 
          size={300}
          bgColor="#ffffff"
          fgColor="#000000"
          includeMargin={true}
         />
        </div>
      ))}
    </div>
  );
}