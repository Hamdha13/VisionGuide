import { ArrowLeft, ArrowRight, ArrowUp, OctagonAlert } from "lucide-react";
import type { GuidanceState } from "@/hooks/useObjectDetection";

const iconMap = {
  left: ArrowLeft,
  right: ArrowRight,
  forward: ArrowUp,
  stop: OctagonAlert,
};

const urgencyStyles = {
  safe: "text-primary border-primary/40 shadow-glow",
  caution: "text-[hsl(var(--warning))] border-[hsl(var(--warning))]/50",
  danger: "text-destructive border-destructive/60 shadow-[0_0_40px_hsl(var(--destructive)/0.5)]",
};

export const GuidancePanel = ({ guidance, active }: { guidance: GuidanceState; active: boolean }) => {
  const Icon = iconMap[guidance.direction];
  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Navigation</h3>
        <span className={`h-2 w-2 rounded-full ${active ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
      </div>
      <div className={`relative flex flex-col items-center justify-center rounded-xl border-2 ${urgencyStyles[guidance.urgency]} bg-secondary/40 p-8 transition-all duration-300`}>
        <Icon className="h-24 w-24" strokeWidth={2.5} />
        <p className="mt-4 text-center text-lg font-semibold capitalize">
          {guidance.direction === "stop" ? "STOP" : guidance.direction}
        </p>
      </div>
      <div className="rounded-xl bg-secondary/40 p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Audio Guidance</p>
        <p className="text-base font-medium">{active ? guidance.message : "Start camera to begin"}</p>
      </div>
    </div>
  );
};
