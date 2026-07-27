"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { adminBtnGhost, adminBtnPrimary } from "@/components/admin/ui";

const LOGO_SRC = "/images/kian-prive-logo.png";

type BrandedQrCardProps = {
  value: string;
  label?: string;
  filename?: string;
  size?: number;
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

export function BrandedQrCard({
  value,
  label = "Scan to shop",
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
        const footer = 40;
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
        canvas.height = size + footer;

        ctx.fillStyle = "#fffdf8";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const pad = 16;
        ctx.strokeStyle = "#c9a45a";
        ctx.lineWidth = 2;
        ctx.strokeRect(pad, pad, size - pad * 2, size - pad * 2);

        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, "#fff8ee");
        gradient.addColorStop(1, "#f7efe2");
        ctx.fillStyle = gradient;
        ctx.fillRect(pad + 4, pad + 4, size - pad * 2 - 8, size - pad * 2 - 8);

        const [qrImg, logoImg] = await Promise.all([loadImage(qrDataUrl), loadImage(LOGO_SRC)]);
        if (cancelled) return;

        const qrX = (size - qrSize) / 2;
        const qrY = (size - qrSize) / 2;
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

        // Soft pad + logo in the center (high ECC keeps scans reliable)
        const badge = Math.round(size * 0.22);
        const bx = size / 2 - badge / 2;
        const by = size / 2 - badge / 2;
        const r = 12;

        ctx.fillStyle = "#fffdf8";
        ctx.beginPath();
        ctx.moveTo(bx + r, by);
        ctx.arcTo(bx + badge, by, bx + badge, by + badge, r);
        ctx.arcTo(bx + badge, by + badge, bx, by + badge, r);
        ctx.arcTo(bx, by + badge, bx, by, r);
        ctx.arcTo(bx, by, bx + badge, by, r);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#e5d7c2";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const logoPad = 8;
        const logoBox = badge - logoPad * 2;
        const aspect = logoImg.naturalWidth / Math.max(logoImg.naturalHeight, 1);
        let drawW = logoBox;
        let drawH = logoBox / aspect;
        if (drawH > logoBox) {
          drawH = logoBox;
          drawW = logoBox * aspect;
        }
        const lx = size / 2 - drawW / 2;
        const ly = size / 2 - drawH / 2;
        ctx.drawImage(logoImg, lx, ly, drawW, drawH);

        // Footer: action label only — no names or codes
        ctx.fillStyle = "#8a682e";
        ctx.font = "600 13px Georgia, serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label.toUpperCase(), size / 2, size + footer / 2);

        setReady(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "QR failed");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [value, label, size]);

  function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function downloadSvg() {
    // SVG export is QR-only; PNG includes the logo mark.
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
      <p className="text-[11px] text-[#6f6251]">PNG includes the KIAN Privé logo. Label only — no personal names.</p>
    </div>
  );
}
