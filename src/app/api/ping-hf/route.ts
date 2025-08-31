import { NextResponse } from "next/server";

export async function GET() {
  try {
    const r = await fetch("https://Amama02-pin-persona-25-august.hf.space/", {
      cache: "no-store",
    });

    let data;
    try {
      data = await r.json();
    } catch {
      data = { text: await r.text() };
    }

    return NextResponse.json({ ok: true, response: data });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json(
        { ok: false, error: e.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { ok: false, error: "Unknown error" },
      { status: 500 }
    );
  }
}
