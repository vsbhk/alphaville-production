import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";

function readHidden(label) {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
    return new Promise((resolve) => {
      process.stdout.write(label);
      let buffer = "";
      const onData = (chunk) => {
        buffer += chunk.toString("utf8");
        const newline = buffer.indexOf("\n");
        if (newline === -1) return;
        process.stdin.off("data", onData);
        resolve(buffer.slice(0, newline).replace(/\r$/, ""));
      };
      process.stdin.on("data", onData);
      process.stdin.resume();
    });
  }
  return new Promise((resolve, reject) => {
    process.stdout.write(label);
    let value = "";
    const previousRawMode = process.stdin.isRaw;
    process.stdin.setRawMode(true);
    process.stdin.resume();
    const onData = (chunk) => {
      for (const char of chunk.toString("utf8")) {
        if (char === "\u0003") {
          process.stdin.off("data", onData);
          process.stdin.setRawMode(previousRawMode ?? false);
          reject(new Error("Cancelled"));
          return;
        }
        if (char === "\r" || char === "\n") {
          process.stdin.off("data", onData);
          process.stdin.setRawMode(previousRawMode ?? false);
          process.stdout.write("\n");
          resolve(value);
          return;
        }
        if (char === "\u007f" || char === "\b") value = value.slice(0, -1);
        else value += char;
      }
    };
    process.stdin.on("data", onData);
  });
}

async function addVercelEnv(name, value) {
  const child = spawn("vercel", ["env", "add", name, "--environment", "production", "--sensitive", "--yes"], {
    stdio: ["pipe", "ignore", "pipe"],
  });
  let stderr = "";
  child.stderr.on("data", (chunk) => { stderr += chunk.toString("utf8"); });
  child.stdin.end(`${value}\n`);
  const code = await new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", resolve);
  });
  if (code !== 0) throw new Error(`Could not add ${name} to Vercel Production${stderr ? `: ${stderr.trim()}` : ""}`);
}

const configureVercel = process.argv.includes("--configure-vercel");
const appKey = process.env.DROPBOX_APP_KEY || await readHidden("Dropbox app key: ");
const appSecret = process.env.DROPBOX_APP_SECRET || await readHidden("Dropbox app secret: ");
if (!appKey || !appSecret) throw new Error("Dropbox app key and secret are required");

const port = 53682;
const redirectUri = `http://localhost:${port}/callback`;
const state = randomBytes(24).toString("hex");
const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", redirectUri);
  if (url.pathname !== "/callback") {
    response.writeHead(404).end("Not found");
    return;
  }
  if (url.searchParams.get("state") !== state) {
    response.writeHead(400).end("OAuth state did not match. You can close this tab.");
    server.close();
    return;
  }
  const code = url.searchParams.get("code");
  if (!code) {
    response.writeHead(400).end("Dropbox did not return an authorization code. You can close this tab.");
    server.close();
    return;
  }
  try {
    const tokenResponse = await fetch("https://api.dropbox.com/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${appKey}:${appSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ code, grant_type: "authorization_code", redirect_uri: redirectUri }),
    });
    if (!tokenResponse.ok) throw new Error(`Dropbox token exchange returned ${tokenResponse.status}`);
    const token = await tokenResponse.json();
    if (!token.refresh_token) throw new Error("Dropbox did not issue a refresh token. Confirm offline access is enabled.");
    response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" }).end("Authorization complete. Return to the terminal for setup status.");
    if (configureVercel) {
      await addVercelEnv("DROPBOX_APP_KEY", appKey);
      await addVercelEnv("DROPBOX_APP_SECRET", appSecret);
      await addVercelEnv("DROPBOX_REFRESH_TOKEN", token.refresh_token);
      console.log("Dropbox app key, app secret, and refresh token were added as sensitive Vercel Production variables.");
    } else {
      console.log("Dropbox refresh token (keep private; do not paste it into chat or commit it):");
      console.log(token.refresh_token);
    }
    server.close();
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" }).end("Token exchange failed. Return to the terminal for details.");
    console.error(error instanceof Error ? error.message : "Dropbox token exchange failed");
    server.close();
    process.exitCode = 1;
  }
});

server.listen(port, "127.0.0.1", () => {
  const authorizeUrl = new URL("https://www.dropbox.com/oauth2/authorize");
  authorizeUrl.search = new URLSearchParams({
    client_id: appKey,
    response_type: "code",
    redirect_uri: redirectUri,
    state,
    token_access_type: "offline",
  }).toString();
  console.log(`Open this URL to authorize the Dropbox app:\n${authorizeUrl.toString()}`);
  console.log(`Waiting for Dropbox at ${redirectUri}`);
});
