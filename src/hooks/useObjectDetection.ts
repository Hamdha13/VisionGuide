import { useCallback, useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

export type Detection = cocoSsd.DetectedObject;
export type Direction = "left" | "right" | "forward" | "stop";

export interface GuidanceState {
  direction: Direction;
  message: string;
  urgency: "safe" | "caution" | "danger";
}

interface UseObjectDetectionOptions {
  enabled: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  onGuidance?: (g: GuidanceState) => void;
  speak: boolean;
}

export function useObjectDetection({ enabled, videoRef, onGuidance, speak }: UseObjectDetectionOptions) {
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [loading, setLoading] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [guidance, setGuidance] = useState<GuidanceState>({
    direction: "forward",
    message: "Path is clear",
    urgency: "safe",
  });
  const rafRef = useRef<number>();
  const lastSpeakRef = useRef<{ msg: string; t: number }>({ msg: "", t: 0 });

  // Load model once
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      await tf.ready();
      const m = await cocoSsd.load({ base: "lite_mobilenet_v2" });
      if (!cancelled) {
        setModel(m);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const speakMessage = useCallback((msg: string, urgent: boolean) => {
    if (!speak || typeof window === "undefined" || !window.speechSynthesis) return;
    const now = Date.now();
    const cooldown = urgent ? 1200 : 2500;
    if (lastSpeakRef.current.msg === msg && now - lastSpeakRef.current.t < cooldown) return;
    lastSpeakRef.current = { msg, t: now };
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(msg);
    u.rate = urgent ? 1.15 : 1;
    u.pitch = 1;
    u.volume = 1;
    window.speechSynthesis.speak(u);
  }, [speak]);

  const analyze = useCallback((preds: Detection[], w: number, h: number): GuidanceState => {
    if (!preds.length) {
      return { direction: "forward", message: "Path clear, move forward", urgency: "safe" };
    }
    // Focus on objects in lower 2/3 (closer to user) and reasonably large
    const relevant = preds.filter((p) => {
      const [, y, , bh] = p.bbox;
      const area = (p.bbox[2] * p.bbox[3]) / (w * h);
      return y + bh > h * 0.33 && area > 0.03;
    });
    if (!relevant.length) {
      return { direction: "forward", message: "Path clear, move forward", urgency: "safe" };
    }

    const leftZone = w / 3;
    const rightZone = (w / 3) * 2;
    let leftBlock = 0, centerBlock = 0, rightBlock = 0;
    let maxArea = 0;
    let nearestLabel = "";

    for (const p of relevant) {
      const [x, , bw, bh] = p.bbox;
      const cx = x + bw / 2;
      const area = (bw * bh) / (w * h);
      if (area > maxArea) { maxArea = area; nearestLabel = p.class; }
      if (cx < leftZone) leftBlock += area;
      else if (cx > rightZone) rightBlock += area;
      else centerBlock += area;
    }

    // Danger: large object dead center
    if (centerBlock > 0.18 || maxArea > 0.35) {
      if (leftBlock < rightBlock && leftBlock < 0.15) {
        return { direction: "left", message: `${nearestLabel} ahead, move left`, urgency: "danger" };
      }
      if (rightBlock < 0.15) {
        return { direction: "right", message: `${nearestLabel} ahead, move right`, urgency: "danger" };
      }
      return { direction: "stop", message: `Stop. ${nearestLabel} blocking path`, urgency: "danger" };
    }
    if (centerBlock > 0.06) {
      if (leftBlock <= rightBlock) {
        return { direction: "left", message: `${nearestLabel} ahead, veer left`, urgency: "caution" };
      }
      return { direction: "right", message: `${nearestLabel} ahead, veer right`, urgency: "caution" };
    }
    return { direction: "forward", message: "Path clear, move forward", urgency: "safe" };
  }, []);

  // Detection loop
  useEffect(() => {
    if (!enabled || !model || !videoRef.current) return;
    const video = videoRef.current;
    let stopped = false;

    const tick = async () => {
      if (stopped) return;
      if (video.readyState >= 2 && video.videoWidth > 0) {
        try {
          const preds = await model.detect(video, 8, 0.5);
          setDetections(preds);
          const g = analyze(preds, video.videoWidth, video.videoHeight);
          setGuidance((prev) => {
            if (prev.message !== g.message || prev.urgency !== g.urgency) {
              onGuidance?.(g);
              speakMessage(g.message, g.urgency === "danger");
            }
            return g;
          });
        } catch (e) {
          // swallow
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      stopped = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.speechSynthesis?.cancel();
    };
  }, [enabled, model, videoRef, analyze, onGuidance, speakMessage]);

  return { model, loading, detections, guidance };
}
