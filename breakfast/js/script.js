// Основа Simple Forms Examples: стол, арбуз, случайная еда, очистка.
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const addButton = document.querySelector(".changeButton");
const clearButton = document.querySelector(".clearButton");
const statusLine = document.querySelector(".status");
const reaction = document.querySelector("#reaction");
const quote = document.querySelector("#quote");
let evidence = [];
const pictures = {};
function loadPicture(name) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      pictures[name] = img;
      resolve();
    };
    img.onerror = reject;
    img.src = `images/${name}.png`;
  });
}
function drawTable() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#d6c7aa";
  ctx.fillRect(0, 0, 720, 400);
  ctx.fillStyle = "#e6dcc7";
  ctx.beginPath();
  ctx.roundRect(24, 24, 672, 352, 8);
  ctx.fill();
  ctx.strokeStyle = "#b6a88d";
  ctx.lineWidth = 1;
  ctx.strokeRect(36, 36, 648, 328);
  // Сохраняем круглую тарелку и центральный арбуз исходной мини-игры.
  ctx.beginPath();
  ctx.arc(360, 200, 68, 0, Math.PI * 2);
  ctx.fillStyle = "#f6f0e4";
  ctx.fill();
  ctx.strokeStyle = "#c9bc9f";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.drawImage(pictures.watermelon, 325, 165, 70, 70);
  evidence.forEach((item) => {
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(item.angle);
    ctx.fillStyle = "#f6f0e4";
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.drawImage(pictures[item.type], -31, -31, 62, 62);
    ctx.restore();
  });
}
function setReaction(src, alt, text) {
  reaction.src = `images/${src}.webp`;
  reaction.alt = alt;
  quote.textContent = text;
}
addButton.addEventListener("click", () => {
  if (evidence.length >= 12) {
    statusLine.textContent = "Стол полон. Уберите улики, чтобы продолжить.";
    return;
  }
  // 12 отдельных мест исключают случайное перекрытие тарелок.
  const slots = [
    [95, 95],
    [225, 95],
    [495, 95],
    [625, 95],
    [95, 200],
    [225, 200],
    [495, 200],
    [625, 200],
    [95, 305],
    [225, 305],
    [495, 305],
    [625, 305],
  ];
  const unused = slots.filter((_, i) => !evidence.some((e) => e.slot === i));
  const spot = unused[Math.floor(Math.random() * unused.length)];
  evidence.push({
    x: spot[0],
    y: spot[1],
    slot: slots.indexOf(spot),
    angle: (Math.random() - 0.5) * 0.3,
    type: Math.random() < 0.5 ? "eggs" : "drink",
  });
  drawTable();
  statusLine.textContent = `Улик на столе: ${evidence.length} из 12. ${evidence.length === 12 ? "Стол накрыт. Дело раскрыто." : "Продолжаем расследование."}`;
  if (evidence.length >= 6)
    setReaction("roses", "Кот с розами", "«Ладно. Завтрак — это красиво».");
  else
    setReaction(
      "ghost",
      "Удивлённый кот с привидением",
      "«Я ничего не трогал. Оно само».",
    );
});
clearButton.addEventListener("click", () => {
  evidence = [];
  drawTable();
  statusLine.textContent = "Улики убраны. Арбуз остался: у него алиби.";
  setReaction(
    "quiet",
    "Кот показывает жест «тише»",
    "«Без адвоката — ни мяу».",
  );
});
document.querySelector(".secret-button").addEventListener("click", (e) => {
  const panel = document.querySelector("#secret");
  panel.hidden = !panel.hidden;
  e.currentTarget.setAttribute("aria-expanded", String(!panel.hidden));
  e.currentTarget.textContent = panel.hidden
    ? "Допросить кота ↗"
    : "Закрыть протокол ↗";
});
Promise.all(["watermelon", "eggs", "drink"].map(loadPicture))
  .then(() => {
    drawTable();
    addButton.disabled = false;
    clearButton.disabled = false;
    statusLine.textContent = "Стол пуст. Арбуз под наблюдением.";
  })
  .catch(() => {
    statusLine.textContent =
      "Не удалось загрузить картинки. Проверьте папку images рядом с index.html.";
  });
