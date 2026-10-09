import { useEffect, useRef } from "react";

const reduceMotionQuery = "(prefers-reduced-motion: reduce)";

export default function AmbientBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return undefined;

    const reducedMotion = window.matchMedia(reduceMotionQuery);
    const pointer = { x: -1000, y: -1000, tx: -1000, ty: -1000 };
    let width = 0;
    let height = 0;
    let frame = 0;
    let tick = 0;
    let lastPulse = -10;
    let lastFrame = 0;
    let particles = [];
    let pulses = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(72, Math.max(26, Math.round((width * height) / 23000)));
      particles = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.13,
        vy: (Math.random() - 0.5) * 0.13,
        size: index % 8 === 0 ? 1.8 : 0.65 + Math.random() * 0.85,
        depth: 0.25 + Math.random() * 0.75,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const onPointerMove = event => { pointer.tx = event.clientX; pointer.ty = event.clientY; };
    const onPointerLeave = () => { pointer.tx = -1000; pointer.ty = -1000; };
    const drawOrbit = (cx, cy, rx, ry, rotation, alpha, speed, time) => {
      context.save();
      context.translate(cx, cy);
      context.rotate(rotation);
      context.beginPath();
      context.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      context.strokeStyle = `rgba(155, 128, 224, ${alpha})`;
      context.lineWidth = 0.8;
      context.stroke();
      const angle = time * speed;
      const x = Math.cos(angle) * rx;
      const y = Math.sin(angle) * ry;
      context.beginPath();
      context.arc(x, y, 1.7, 0, Math.PI * 2);
      context.fillStyle = `rgba(196, 175, 255, ${alpha * 2.3})`;
      context.shadowColor = "#a887f2";
      context.shadowBlur = 10;
      context.fill();
      context.restore();
    };

    const render = timestamp => {
      if (!reducedMotion.matches) frame = requestAnimationFrame(render);
      if (!reducedMotion.matches && timestamp - lastFrame < 32) return;
      lastFrame = timestamp;
      tick += reducedMotion.matches ? 0 : 0.004;
      context.clearRect(0, 0, width, height);
      const atmosphere = context.createRadialGradient(width * 0.78, height * 0.2, 0, width * 0.78, height * 0.2, Math.max(width, height) * 0.75);
      atmosphere.addColorStop(0, "rgba(84, 59, 140, 0.10)");
      atmosphere.addColorStop(0.5, "rgba(28, 43, 76, 0.035)");
      atmosphere.addColorStop(1, "rgba(5, 9, 18, 0)");
      context.fillStyle = atmosphere;
      context.fillRect(0, 0, width, height);

      pointer.x += (pointer.tx - pointer.x) * 0.035;
      pointer.y += (pointer.ty - pointer.y) * 0.035;
      const cx = width * 0.76 + (pointer.x > -500 ? (pointer.x - width / 2) * 0.009 : 0);
      const cy = height * 0.26 + (pointer.y > -500 ? (pointer.y - height / 2) * 0.009 : 0);
      drawOrbit(cx, cy, Math.min(width * 0.24, 300), Math.min(height * 0.105, 112), -0.3, 0.095, 0.13, tick);
      drawOrbit(cx, cy, Math.min(width * 0.29, 365), Math.min(height * 0.145, 150), 0.26, 0.045, -0.085, tick);

      particles.forEach((particle, index) => {
        if (!reducedMotion.matches) {
          particle.x += particle.vx;
          particle.y += particle.vy;
          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 115 && distance > 0) {
            const force = (115 - distance) / 115 * 0.018 * particle.depth;
            particle.x += dx / distance * force;
            particle.y += dy / distance * force;
          }
          if (particle.x < -8) particle.x = width + 8;
          if (particle.x > width + 8) particle.x = -8;
          if (particle.y < -8) particle.y = height + 8;
          if (particle.y > height + 8) particle.y = -8;
        }
        const pulse = 0.58 + Math.sin(tick * 2 + particle.phase) * 0.2;
        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const nearPointer = Math.hypot(dx, dy) < 110;
        const alpha = (nearPointer ? 0.55 : 0.25) * pulse;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size * (nearPointer ? 1.25 : 1), 0, Math.PI * 2);
        context.fillStyle = index % 9 === 0 ? `rgba(179, 157, 244, ${alpha})` : `rgba(133, 163, 207, ${alpha * 0.65})`;
        context.fill();
      });

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance > 112) continue;
          const shimmer = 0.5 + Math.sin(tick * 1.2 + i * 0.4) * 0.22;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.strokeStyle = `rgba(135, 119, 185, ${(1 - distance / 112) * 0.075 * shimmer})`;
          context.lineWidth = 0.55;
          context.stroke();
        }
      }

      if (!reducedMotion.matches && tick - lastPulse > 1.3 && pulses.length < 2) {
        const source = particles[Math.floor(Math.random() * particles.length)];
        const neighbors = source ? particles.filter(candidate => candidate !== source && Math.hypot(source.x - candidate.x, source.y - candidate.y) < 112) : [];
        const target = neighbors[Math.floor(Math.random() * neighbors.length)];
        if (source && target) { pulses.push({ source, target, progress: 0 }); lastPulse = tick; }
      }
      pulses = pulses.filter(pulse => pulse.progress < 1);
      pulses.forEach(pulse => {
        pulse.progress += 0.008;
        const x = pulse.source.x + (pulse.target.x - pulse.source.x) * pulse.progress;
        const y = pulse.source.y + (pulse.target.y - pulse.source.y) * pulse.progress;
        context.beginPath();
        context.arc(x, y, 1.5, 0, Math.PI * 2);
        context.fillStyle = `rgba(219, 205, 255, ${Math.sin(pulse.progress * Math.PI) * 0.8})`;
        context.shadowColor = "#bda4ff";
        context.shadowBlur = 9;
        context.fill();
        context.shadowBlur = 0;
      });
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="ambient-canvas" aria-hidden="true"/>;
}
