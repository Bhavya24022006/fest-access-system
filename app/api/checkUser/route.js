import admin from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ exists: false });
    }

    let userRecord;

    try {
      userRecord = await admin.auth().getUserByEmail(email);
    } catch {
      return NextResponse.json({ exists: false });
    }

    const snapshot = await admin
      .database()
      .ref("users/" + userRecord.uid)
      .get();

    if (snapshot.exists()) {
      const data = snapshot.val();

      
      return NextResponse.json({
        exists: true,
        name: data.name,
        photo : data.photo || null,
      });
    }

    return NextResponse.json({ exists: false });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ exists: false });
  }
}