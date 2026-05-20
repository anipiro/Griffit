import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Global runtime error overlay for easier debugging when page is blank.
function showErrorOverlay(message: string) {
	try {
		const root = document.getElementById("root");
		if (root) {
			root.innerHTML = `
				<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial; padding:24px; color:#111">
					<h2 style="color:#c53030">Runtime Error</h2>
					<pre style="white-space:pre-wrap; background:#fff3f2; padding:12px; border-radius:6px; border:1px solid #ffdada">${message}</pre>
				</div>`;
		}
	} catch (e) {
		// ignore
	}
}

window.addEventListener("error", (ev) => {
	showErrorOverlay(String(ev.error ?? ev.message ?? ev.filename ?? "Unknown error"));
});
window.addEventListener("unhandledrejection", (ev) => {
	showErrorOverlay(String((ev.reason && (ev.reason.stack || ev.reason.message)) || ev.reason || "Unhandled rejection"));
});

try {
	createRoot(document.getElementById("root")!).render(<App />);
} catch (err: any) {
	showErrorOverlay(String(err?.stack || err?.message || err));
}
