// Контакт для всех кнопок «Написать»: поменяйте ссылку здесь, больше нигде менять не нужно.
// Пример: "https://t.me/ваш_ник"
const CONTACT_URL = "https://t.me/louft";

document.querySelectorAll("[data-contact]").forEach((el) => {
  if (CONTACT_URL) {
    el.setAttribute("href", CONTACT_URL);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  }
});

// Вращающаяся сфера из точек в hero (чистый canvas, без библиотек).
(() => {
  const canvas = document.getElementById("sphere");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const N = 1100;
  const points = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = golden * i;
    points.push({ x: Math.cos(t) * r, y, z: Math.sin(t) * r });
  }

  let w = 0, h = 0, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // от бирюзового к бледно-голубому и белому, у края легкий розовый
  function color(depth, edge) {
    const a = 0.15 + depth * 0.75;
    if (edge > 0.86) return `rgba(253, 233, 255, ${a})`;
    if (depth > 0.7) return `rgba(255, 255, 255, ${a})`;
    const k = depth;
    const r = Math.round(0 + 203 * k);
    const g = Math.round(130 + 125 * k);
    const b = Math.round(124 + 128 * k);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  function draw(angle) {
    ctx.clearRect(0, 0, w, h);
    const radius = Math.min(w, h) * 0.34;
    const cx = w / 2;
    const cy = h / 2;
    const cosA = Math.cos(angle), sinA = Math.sin(angle);
    const tilt = 0.35, cosT = Math.cos(tilt), sinT = Math.sin(tilt);

    for (const p of points) {
      const x1 = p.x * cosA + p.z * sinA;
      const z1 = -p.x * sinA + p.z * cosA;
      const y2 = p.y * cosT - z1 * sinT;
      const z2 = p.y * sinT + z1 * cosT;
      const depth = (z2 + 1) / 2;
      const edge = Math.sqrt(x1 * x1 + y2 * y2);
      const size = 0.6 + depth * 1.6;
      ctx.fillStyle = color(depth, edge);
      ctx.beginPath();
      ctx.arc(cx + x1 * radius, cy + y2 * radius, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  let angle = 0;
  let running = true;
  function loop() {
    if (!running) return;
    angle += 0.0035;
    draw(angle);
    requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener("resize", () => { resize(); draw(angle); });

  if (reduce) {
    draw(0.6);
    return;
  }

  // не крутим сферу, когда hero не видно
  new IntersectionObserver((entries) => {
    const visible = entries[0].isIntersecting;
    if (visible && !running) { running = true; loop(); }
    if (!visible) running = false;
  }).observe(canvas);

  loop();
})();
