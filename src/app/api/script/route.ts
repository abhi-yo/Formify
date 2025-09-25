import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const debug = searchParams.get("debug") === "true";

    const scriptPath = join(process.cwd(), "public", "formify.js");
    let script = await readFile(scriptPath, "utf-8");

    if (key) {
      script = script.replace(
        "// Auto-initialize if API key is provided via script tag",
        `// Auto-initialized with key: ${key.substring(0, 8)}...
        window.formify = new FormifySDK('${key}', { debug: ${debug} });
        window.formify.init();`
      );
    }

    return new NextResponse(script, {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Script serving error:", error);
    return new NextResponse("// Script loading error", {
      status: 500,
      headers: {
        "Content-Type": "application/javascript",
      },
    });
  }
}

