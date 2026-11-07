const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const motionButton = document.querySelector("#animate");
const nextButton = document.querySelector("#next");
const speed = document.querySelector("#speed");
const statusLine = document.querySelector(".status");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const exhibits = [
  { file: "worm", name: "Свидетель утверждает, что он просто червь." },
  { file: "love", name: "Улика № 02. Подозрительно большое сердце." },
  { file: "rock", name: "Улика № 03. Следствие зашло в рок-тупик." },
];
let selected = 0,
  running = false,
  phase = 0,
  lastTime = 0,
  frame = 0,
  ready = false;
const images = [];
function drawScene() {
  ctx.clearRect(0, 0, 900, 420);
  ctx.fillStyle = "#29352f";
  ctx.fillRect(0, 0, 900, 420);
  ctx.strokeStyle = "#ffffff0b";
  ctx.lineWidth = 1;
  for (let x = 30; x < 900; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 420);
    ctx.stroke();
  }
  for (let y = 30; y < 420; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(900, y);
    ctx.stroke();
  }
  ctx.font = "12px monospace";
  ctx.fillStyle = "#c8cebd";
  ctx.fillText("A / ОБЪЕКТ", 65, 63);
  ctx.fillText("B / СЛЕД", 352, 63);
  ctx.fillText("C / СВИДЕТЕЛЬ", 637, 63);
  // Требование 3а: цветной квадрат с заливкой, стороны равны.
  ctx.fillStyle = "#b66f50";
  ctx.fillRect(65, 130, 160, 160);
  // Требование 3б: окружность-контур, без заливки.
  ctx.beginPath();
  ctx.arc(431, 210, 80, 0, Math.PI * 2);
  ctx.strokeStyle = "#d4c7a7";
  ctx.lineWidth = 3;
  ctx.stroke();
  // Требование 3в: локальное изображение рисуется внутри canvas.
  if (ready) {
    const img = images[selected];
    const size = 170;
    const factor = Math.min(size / img.width, size / img.height);
    const w = img.width * factor,
      h = img.height * factor;
    ctx.save();
    ctx.translate(720, 210 + Math.sin(phase) * 14);
    ctx.rotate(Math.sin(phase * 0.7) * 0.045);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
  ctx.fillStyle = "#a8b29e";
  ctx.font = "11px monospace";
  ctx.fillText("01 / ЗАЛИВКА", 65, 352);
  ctx.fillText("02 / КОНТУР", 352, 352);
  ctx.fillText("03 / ИЗОБРАЖЕНИЕ", 637, 352);
}
function tick(time) {
  if (!running) return;
  if (lastTime)
    phase += Math.min((time - lastTime) / 1000, 0.05) * Number(speed.value) * 2;
  lastTime = time;
  drawScene();
  frame = requestAnimationFrame(tick);
}
function setRunning(value) {
  running = value;
  motionButton.setAttribute("aria-pressed", String(value));
  motionButton.textContent = value ? "Пауза" : "Оживить улику";
  lastTime = 0;
  cancelAnimationFrame(frame);
  if (value) frame = requestAnimationFrame(tick);
  else drawScene();
  statusLine.textContent = value
    ? "Улика ожила. Следствие сохраняет спокойствие."
    : exhibits[selected].name;
}
function nextExhibit() {
  if (!ready) return;
  selected = (selected + 1) % exhibits.length;
  document.querySelector("#exhibit").textContent = String(
    selected + 1,
  ).padStart(2, "0");
  statusLine.textContent = exhibits[selected].name;
  drawScene();
}
motionButton.addEventListener("click", () => setRunning(!running));
nextButton.addEventListener("click", nextExhibit);
canvas.addEventListener("click", (e) => {
  const box = canvas.getBoundingClientRect();
  const x = ((e.clientX - box.left) * 900) / box.width,
    y = ((e.clientY - box.top) * 420) / box.height;
  if (x > 610 && x < 830 && y > 95 && y < 320) nextExhibit();
});
canvas.addEventListener("keydown", (e) => {
  if (!ready) return;
  if (e.code === "Space") {
    e.preventDefault();
    setRunning(!running);
  }
  if (e.key === "Enter") {
    e.preventDefault();
    nextExhibit();
  }
});
let previous = "";
document.addEventListener("keydown", (e) => {
  if (e.target.matches("input,textarea")) return;
  if (previous === "6" && e.key === "7") {
    const p = document.querySelector("#secret");
    p.hidden = !p.hidden;
  }
  previous = e.key;
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && running) setRunning(false);
});
reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches && running) setRunning(false);
});
Promise.all(
  exhibits.map(
    (item) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        images.push(img);
        img.onload = resolve;
        img.onerror = reject;
        img.src = `images/${item.file}.webp`;
      }),
  ),
)
  .then(() => {
    ready = true;
    motionButton.disabled = false;
    nextButton.disabled = false;
    drawScene();
    statusLine.textContent = exhibits[0].name;
  })
  .catch(() => {
    drawScene();
    statusLine.textContent =
      "Не удалось загрузить изображения. Проверьте папку images.";
  });
drawScene();
