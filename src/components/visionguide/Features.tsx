import { Cpu, Volume2, ShieldCheck, Zap } from "lucide-react";

const features = [
  { icon: Cpu, title: "On-Device AI", desc: "TensorFlow.js runs entirely in your browser. No server, no uploads, full privacy." },
  { icon: Zap, title: "Real-Time Detection", desc: "Identifies people, vehicles, furniture and 80+ obstacles at camera framerate." },
  { icon: Volume2, title: "Spoken Guidance", desc: "Clear voice instructions — move left, right, forward, or stop — using the Web Speech API." },
  { icon: ShieldCheck, title: "Safety First", desc: "Three-zone path analysis warns of danger and routes you around obstacles automatically." },
];

export const Features = () => (
  <section className="container py-16">
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {features.map((f, i) => (
        <div key={f.title} className="glass rounded-2xl p-6 hover:shadow-glow transition-smooth animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary mb-4">
            <f.icon className="h-5 w-5 text-primary-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-1.5">{f.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
        </div>
      ))}
    </div>
  </section>
);
