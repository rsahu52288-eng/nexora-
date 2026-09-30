import { spawn } from "child_process";

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

// Launch Edge with remote debugging
const edge = spawn(edgePath, [
  "--headless=new",
  "--remote-debugging-port=9222",
  "http://localhost:3000",
]);

async function main() {
  await new Promise((r) => setTimeout(r, 2000));

  try {
    const listRes = await fetch("http://127.0.0.1:9222/json");
    const pages = await listRes.json();
    console.log("Pages found:", pages.length);

    const targetPage = pages.find((p) => p.url.includes("localhost:3000")) || pages[0];
    if (!targetPage || !targetPage.webSocketDebuggerUrl) {
      console.log("No websocket debugger URL:", targetPage);
      return;
    }

    const wsUrl = targetPage.webSocketDebuggerUrl;
    console.log("Connecting to CDP WS:", wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));
      ws.send(JSON.stringify({ id: 2, method: "Log.enable" }));
      ws.send(JSON.stringify({ id: 3, method: "Page.enable" }));
      ws.send(JSON.stringify({ id: 4, method: "Page.reload" }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === "Runtime.exceptionThrown") {
        console.error(">>> CLIENT-SIDE EXCEPTION:", JSON.stringify(msg.params.exceptionDetails, null, 2));
      } else if (msg.method === "Runtime.consoleAPICalled") {
        console.log(">>> CONSOLE:", msg.params.type, msg.params.args.map((a) => a.value || a.description).join(" "));
      } else if (msg.method === "Log.entryAdded") {
        console.log(">>> LOG ENTRY:", JSON.stringify(msg.params.entry));
      }
    };

    await new Promise((r) => setTimeout(r, 6000));
  } catch (err) {
    console.error("CDP Error:", err);
  } finally {
    edge.kill();
    process.exit(0);
  }
}

main();
