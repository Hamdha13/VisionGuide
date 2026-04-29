import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Volume2, VolumeX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Hero } from "@/components/visionguide/Hero";
import { Features } from "@/components/visionguide/Features";
import { CameraView } from "@/components/visionguide/CameraView";
import { GuidancePanel } from "@/components/visionguide/GuidancePanel";
import { useObjectDetection } from "@/hooks/useObjectDetection";

const Index = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [speak, setSpeak] = useState(true);
  const [starting, setStarting] = useState(false);

  const { loading, detections, guidance } = useObjectDetection({
    enabled: active,
    videoRef,
    speak,
  });

  const startCamera = useCallback(async () => {
    try {
      setStarting(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
      toast.success("Camera active — VisionGuide is watching");
    } catch (e) {
      toast.error("Couldn't access camera. Please grant permission.");
    } finally {
      setStarting(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
    window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const detectionCount = detections.length;

  return (
    <main className="min-h-screen">
      <Hero />

      <section className="container py-10 md:py-14">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <CameraView videoRef={videoRef} detections={detections} guidance={guidance} active={active} />

            <div className="glass rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {!active ? (
                  <Button
                    size="lg"
                    onClick={startCamera}
                    disabled={starting || loading}
                    className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow font-semibold"
                  >
                    {starting || loading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> {loading ? "Loading model" : "Starting"}</>
                    ) : (
                      <><Camera className="h-4 w-4" /> Start VisionGuide</>
                    )}
                  </Button>
                ) : (
                  <Button size="lg" variant="destructive" onClick={stopCamera} className="font-semibold">
                    <CameraOff className="h-4 w-4" /> Stop
                  </Button>
                )}
                <div className="flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2">
                  {speak ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-sm font-medium">Voice</span>
                  <Switch checked={speak} onCheckedChange={setSpeak} />
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Stat label="Objects" value={detectionCount} />
                <Stat label="Status" value={active ? "Live" : "Idle"} accent={active} />
                <Stat label="Voice" value={speak ? "On" : "Off"} />
              </div>
            </div>
          </div>

          <GuidancePanel guidance={guidance} active={active} />
        </div>

        {detectionCount > 0 && active && (
          <div className="mt-6 glass rounded-2xl p-5">
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Detected Around You</h3>
            <div className="flex flex-wrap gap-2">
              {detections.map((d, i) => (
                <span key={i} className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-sm">
                  {d.class} <span className="text-muted-foreground">{Math.round(d.score * 100)}%</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      <Features />

      <footer className="container py-10 text-center text-sm text-muted-foreground">
        <p>VisionGuide · Built with TensorFlow.js COCO-SSD · Runs entirely on your device</p>
      </footer>
    </main>
  );
};

const Stat = ({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) => (
  <div className="text-center">
    <div className={`font-bold text-lg ${accent ? "text-primary" : ""}`}>{value}</div>
    <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
  </div>
);

export default Index;
