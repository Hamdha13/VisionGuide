import { useEffect, useRef } from "react";
import type { Detection, GuidanceState } from "@/hooks/useObjectDetection";

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>;
  detections: Detection[];
  guidance: GuidanceState;
  active: boolean;
}

export const CameraView = ({ videoRef, detections, guidance, active }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (!w || !h) return;
      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);

      // Zone guides
      ctx.strokeStyle = "rgba(56, 240, 230, 0.25)";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(w / 3, 0); ctx.lineTo(w / 3, h);
      ctx.moveTo((w / 3) * 2, 0); ctx.lineTo((w / 3) * 2, h);
      ctx.stroke();
      ctx.setLineDash([]);

      // Boxes
      detections.forEach((d) => {
        const [x, y, bw, bh] = d.bbox;
        const color =
          guidance.urgency === "danger"
            ? "hsl(0, 90%, 60%)"
            : guidance.urgency === "caution"
            ? "hsl(38, 95%, 58%)"
            : "hsl(175, 95%, 55%)";
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, bw, bh);
        ctx.fillStyle = color;
        const label = `${d.class} ${Math.round(d.score * 100)}%`;
        ctx.font = "bold 18px Inter, sans-serif";
        const tw = ctx.measureText(label).width + 16;
        ctx.fillRect(x, y - 28, tw, 28);
        ctx.fillStyle = "#001014";
        ctx.fillText(label, x + 8, y - 8);
      });
    };

    let raf: number;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [detections, guidance, videoRef]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border bg-black aspect-video shadow-card ${active ? "scan-line" : ""}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      {!active && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center space-y-3">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full glass animate-float">
              <span className="text-3xl">📷</span>
            </div>
            <p className="text-muted-foreground">Camera is off</p>
          </div>
        </div>
      )}
      {active && (
        <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium">
          <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
          LIVE
        </div>
      )}
    </div>
  );
};
