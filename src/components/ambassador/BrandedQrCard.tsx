"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { adminBtnGhost, adminBtnPrimary } from "@/components/admin/ui";

type BrandedQrCardProps = {
  value: string;
  label?: string;
  code?: string;
  filename?: string;
  size?: number;
};

export function BrandedQrCard({
  value,
  label = "Scan to shop",
  code,
  filename = "kian-prive-qr.png",
  size = 280,
}: BrandedQrCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) return;

    let cancelled = false;
    setReady(false);
    setError("");

    void (async () => {
      try {
        const qrSize = Math.round(size * 0.72);
        const qrDataUrl = await QRCode.toDataURL(value, {
          errorCorrectionLevel: "H",
          margin: 1,
          width: qrSize,
          color: {
            dark: "#5c451c",
            light: "#fffdf8",
          },
        });

        if (cancelled) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = size;
        canvas.height = size + 56;

        // Background card
        ctx.fillStyle = "#fffdf8";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Soft gold frame
        const pad = 16;
        ctx.strokeStyle = "#c9a45a";
        ctx.lineWidth = 2;
        ctx.strokeRect(pad, pad, size - pad * 2, size - pad * 2);

        // Inner wash
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, "#fff8ee");
        gradient.addColorStop(1, "#f7efe2");
        ctx.fillStyle = gradient;
        ctx.fillRect(pad + 4, pad + 4, size - pad * 2 - 8, size - pad * 2 - 8);

        const qrImg = new Image();
        await new Promise<void>((resolve, reject) => {
          qrImg.onload = () => resolve();
          qrImg.onerror = () => reject(new Error("Could not render QR"));
          qrImg.src = qrDataUrl;
        });

        const qrX = (size - qrSize) / 2;
        const qrY = (size - qrSize) / 2;
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

        // Center badge
        const badge = 44;
        const bx = size / 2 - badge / 2;
        const by = size / 2 - badge / 2;
        ctx.fillStyle = "#8a682e";
        ctx.beginPath();
        const r = 10;
        ctx.moveTo(bx + r, by);
        ctx.arcTo(bx + badge, by, bx + badge, by + badge, r);
        ctx.arcTo(bx + badge, by + badge, bx, by + badge, r);
        ctx.arcTo(bx, by + badge, bx, by, r);
        ctx.arcTo(bx, by, bx + badge, by, r);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#fffdf8";
        ctx.font = "600 11px Georgia, serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("KP", size / 2, size / 2);

        // Footer label
        ctx.fillStyle = "#8a682e";
        ctx.font = "600 12px Georgia, serif";
        ctx.fillText(label.toUpperCase(), size / 2, size + 18);
        if (code) {
          ctx.fillStyle = "#5f5344";
          ctx.font = "11px ui-monospace, monospace";
          ctx.fillText(code, size / 2, size + 36);
        }

        setReady(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "QR failed");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [value, label, code, size]);

  function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function downloadSvg() {
    try {
      const svg = await QRCode.toString(value, {
        type: "svg",
        errorCorrectionLevel: "H",
        margin: 2,
        color: { dark: "#5c451c", light: "#fffdf8" },
        width: 512,
      });
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = filename.replace(/\.png$/i, ".svg");
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Could not download SVG.");
    }
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-[#e5d7c2] bg-[#fffdf8] p-3 shadow-[0_12px_30px_rgba(47,36,22,0.06)]">
        <canvas ref={canvasRef} className="mx-auto block h-auto w-full max-w-[280px]" />
        {!ready && !error ? <p className="py-8 text-center text-sm text-[#6f6251]">Generating QR…</p> : null}
        {error ? <p className="py-4 text-center text-sm text-[#8a3a3a]">{error}</p> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={adminBtnPrimary} disabled={!ready} onClick={downloadPng}>
          Download PNG
        </button>
        <button type="button" className={adminBtnGhost} disabled={!value} onClick={() => void downloadSvg()}>
          Download SVG
        </button>
      </div>
    </div>
  );
}
