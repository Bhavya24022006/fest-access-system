import admin from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";
import { sendLoginEmail } from "@/lib/sendEmail";
export async function POST(req) {
  try {
    const { name, email, event, photo } = await req.json();

    const db = admin.database();

    let userRecord;

    // 🔍 check if user exists
    try {
      userRecord = await admin.auth().getUserByEmail(email);
    } catch {
      userRecord = null;
    }

    let uid;
    let password = null;

    // 🆕 CREATE USER IF NOT EXISTS
    if (!userRecord) {
      password = Math.random().toString(36).slice(-8);

      const newUser = await admin.auth().createUser({
        email,
        password,
        displayName: name,
      });
      uid = newUser.uid;
 
      await db.ref("users/" + uid).set({
        name,
        email,
        role: "user",
        photo: photo || "",
      });
      await sendLoginEmail(email, password);

      console.log("New user created:", email, password);

    } else {
      uid = userRecord.uid;
    }

    // 🎟 CREATE PASS
    const passRef = db.ref("passes").push();
    const token = crypto.randomUUID();

    await passRef.set({
      id: passRef.key,
      userId: uid,
      email,
      name,
      event,
      token,
      photo: photo || "", // 🔥 keep photo here too
      used: false,
    });

    return NextResponse.json({
      success: true,
      message: "Pass created successfully",
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}