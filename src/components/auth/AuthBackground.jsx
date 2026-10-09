import { useEffect, useRef } from "react";

export default function AuthBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let width = 0;
    let height = 0;
    let pointer = { x: -1000, y: -1000 };
    let points = [];
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = width < 640 ? 24 : Math.min(56, Math.round(width / 24));
      points = Array.from({ length: count }, (_, index) => ({
        x: (index * 97.31 + 35) % width, y: (index * 173.17 + 57) % height,
        dx: ((index % 3) - 1) * .11, dy: ((index % 5) - 2) * .07, phase: index * 1.7,
      }));
      draw(0, true);
    };
    const draw = (time, still = false) => {
      context.clearRect(0, 0, width, height);
      points.forEach((point, index) => {
        if (!still && !reduced.matches) {
          point.x += point.dx; point.y += point.dy;
          if (point.x < 0 || point.x > width) point.dx *= -1;
          if (point.y < 0 || point.y > height) point.dy *= -1;
        }
        const mx = point.x - pointer.x, my = point.y - pointer.y;
        const distance = Math.hypot(mx, my);
        const push = distance < 110 ? (110 - distance) * .002 : 0;
        const x = point.x + (distance ? mx / distance * push : 0);
        const y = point.y + (distance ? my / distance * push : 0);
        points.slice(index + 1).forEach(other => {
          const d = Math.hypot(point.x - other.x, point.y - other.y);
          if (d < 130) {
            context.beginPath(); context.moveTo(x, y); context.lineTo(other.x, other.y);
            context.strokeStyle = `rgba(165, 137, 230, ${(1 - d / 130) * .14})`;
            context.lineWidth = 1; context.stroke();
          }
        });
        const pulse = .65 + Math.sin(time * .0007 + point.phase) * .25;
        context.beginPath(); context.arc(x, y, index % 7 === 0 ? 1.8 : 1.1, 0, Math.PI * 2);
        context.fillStyle = `rgba(190, 170, 245, ${pulse})`; context.fill();
      });
      if (!still && !reduced.matches) frame = requestAnimationFrame(draw);
    };
    const move = event => { pointer = { x: event.clientX, y: event.clientY }; };
    const visibility = () => { cancelAnimationFrame(frame); if (!document.hidden && !reduced.matches) frame = requestAnimationFrame(draw); };
    resize();
    if (!reduced.matches) frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    reduced.addEventListener("change", visibility);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); window.removeEventListener("pointermove", move); document.removeEventListener("visibilitychange", visibility); reduced.removeEventListener("change", visibility); };
  }, []);
  return <div className="auth-backdrop" aria-hidden="true"><canvas ref={canvasRef}/><div className="auth-grid"/><div className="auth-nebula auth-nebula-one"/><div className="auth-nebula auth-nebula-two"/><div className="auth-orbit auth-orbit-one"/><div className="auth-orbit auth-orbit-two"/></div>;
}
