import { Eye, Sparkles } from "lucide-react";

export const Hero = () => (
  <header className="relative overflow-hidden border-b border-border">
    <div className="absolute inset-0 grid-pattern opacity-30" />
    <div className="container relative py-16 md:py-24">
      <div className="flex flex-col items-center text-center space-y-6 animate-fade-up">
        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Real-time AI vision · Built for accessibility</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
            <Eye className="h-7 w-7 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Vision<span className="text-gradient-accent">Guide</span>
          </h1>
        </div>
        <p className="max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
          Smart navigation for the visually impaired. Real-time obstacle detection with
          spoken guidance — turn left, right, or stop — powered by on-device computer vision.
        </p>
      </div>
    </div>
  </header>
);
