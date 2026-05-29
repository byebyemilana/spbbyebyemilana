import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const sourcePath = path.resolve(process.cwd(), "../obsidian_spb_places.md");
const outputPath = path.resolve(process.cwd(), "app/places.js");
const imageOverridesPath = path.resolve(process.cwd(), "data/place-images.json");

const ignoredSections = new Set([
  "Как я бы классифицировала в Obsidian",
  "Быстрые подборки",
  "Маршруты на 2-4 часа",
  "Dataview-структура на будущее",
]);

const sectionCategory = {
  "Покушать": "поесть",
  "Доставки": "поесть",
  "Кофе и десерты": "выпить",
  "Бары": "выпить",
  "Сешки/винтажки": "посмотреть",
  "Букинистические": "посмотреть",
  "Магазины": "посмотреть",
  "Активити": "посмотреть",
};

const lineDefinitions = [
  { id: "красная", emoji: "🔴" },
  { id: "синяя", emoji: "🔵" },
  { id: "зеленая", emoji: "🟢" },
  { id: "оранжевая", emoji: "🟠" },
  { id: "фиолетовая", emoji: "🟣" },
  { id: "область", emoji: "🚆" },
  { id: "доставка", emoji: "🛵" },
  { id: "уточнить", emoji: "❔" },
];

function cleanTitle(value) {
  return value.replaceAll("[[", "").replaceAll("]]", "").trim();
}

function extractTags(value) {
  return Array.from(value.matchAll(/#[\p{L}\p{N}_-]+/gu), ([tag]) => tag.replace("#", ""));
}

function withoutTags(value) {
  return value.replace(/#[\p{L}\p{N}_-]+/gu, "").replace(/\s+/g, " ").trim();
}

function withoutComfort(value) {
  return value.replace(/[⭐🌧☀️💸🧭🧍👥🍽☕]/gu, "").replace(/\s+/g, " ").trim();
}

function detectCategory(section, tags, title, lineLabel) {
  if (sectionCategory[section]) {
    return sectionCategory[section];
  }

  const haystack = `${tags.join(" ")} ${title} ${lineLabel}`.toLowerCase();

  if (/(кофе|кафе|чай|десерт|бар)/i.test(haystack)) {
    return "выпить";
  }

  if (/(еда|ресторан|фудкорт|завтрак|рамен|суши|роллы|пицца|азиатское|тайское|корейское|китайское|бургер|паста|стритфуд|грузинское|израильская)/i.test(haystack)) {
    return "поесть";
  }

  if (/(парк|природа|спа|дворцы|залив|сад|остров|водопад|пещеры|курортный)/i.test(haystack)) {
    return "расслабиться";
  }

  return "посмотреть";
}

function categoryDescription(place) {
  const tags = place.tags.filter((tag) => !["еда", "кофе", "бар", "парк"].includes(tag));
  const tagText = tags.length ? ` Формат: ${tags.slice(0, 3).join(", ")}.` : "";
  const metroText = place.lineLabel ? ` Ориентир: ${place.lineLabel}.` : "";

  if (place.sourceSection === "Рядом с Политехнической") {
    return `Близко к дому, можно встроить в короткий маршрут без долгой дороги.${metroText}${tagText}`;
  }

  if (place.sourceSection === "Была, показать Егору") {
    return `Уже проверенное место, которое хочется показать Егору или оставить для спокойной совместной прогулки.${metroText}${tagText}`;
  }

  if (place.sourceSection === "Не была") {
    return `Место из списка “хочу сходить”: хорошо добавить в маршрут, когда окажешься рядом.${metroText}${tagText}`;
  }

  if (place.sourceSection === "Область") {
    return `Отдельная поездка за город: лучше планировать с запасом времени и заранее проверять расписание.${metroText}${tagText}`;
  }

  if (place.category === "поесть") {
    return `Точка из подборки еды: удобно открыть, когда хочется выбрать место рядом с текущей веткой.${metroText}${tagText}`;
  }

  if (place.category === "выпить") {
    return `Пауза на кофе, чай или барный вечер без туристического сценария.${metroText}${tagText}`;
  }

  if (place.category === "расслабиться") {
    return `Спокойное место для прогулки, воздуха и маршрута без спешки.${metroText}${tagText}`;
  }

  return `Городская точка для маршрута: арт, магазины, книги, винтаж или активити.${metroText}${tagText}`;
}

function mapLinkFor(place) {
  const query = [place.title, place.address, "Санкт-Петербург"]
    .filter(Boolean)
    .join(" ");
  return `https://yandex.ru/maps/?text=${encodeURIComponent(query)}`;
}

function detectLines(lineLabel, rawLine) {
  const source = `${lineLabel} ${rawLine}`;
  const lines = lineDefinitions
    .filter((line) => source.includes(line.emoji))
    .map((line) => line.id);

  if (!lines.length) {
    return ["другое"];
  }

  return lines;
}

async function readImageOverrides() {
  try {
    return JSON.parse(await readFile(imageOverridesPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      return {};
    }

    throw error;
  }
}

const imageOverrides = await readImageOverrides();
const markdown = await readFile(sourcePath, "utf8");
const places = [];
let currentSection = "";

for (const rawLine of markdown.split("\n")) {
  const sectionMatch = rawLine.match(/^##\s+(.+)$/);
  if (sectionMatch) {
    currentSection = sectionMatch[1].trim();
    continue;
  }

  if (ignoredSections.has(currentSection)) {
    continue;
  }

  if (!rawLine.startsWith("- ") || !rawLine.includes(" — ")) {
    continue;
  }

  const line = rawLine.slice(2).trim();
  const parts = line.split(" — ");

  if (parts.length < 2) {
    continue;
  }

  const title = cleanTitle(parts[0]);
  const lineLabel = withoutComfort(withoutTags(parts[1] ?? ""));
  const rawAddress = parts.length >= 3 ? parts.slice(2).join(" — ") : parts[1];
  const tags = Array.from(new Set(extractTags(line)));
  const address = withoutComfort(withoutTags(rawAddress))
    .replace(/;$/, "")
    .trim();
  const category = detectCategory(currentSection, tags, title, lineLabel);
  const lines = detectLines(lineLabel, line);

  places.push({
    title,
    description: "",
    category,
    image: "",
    address,
    mapLink: "",
    tags,
    lines,
    linePrimary: lines[0],
    lineLabel,
    sourceSection: currentSection,
  });
}

const seen = new Set();
const uniquePlaces = [];

for (const place of places) {
  const key = `${place.title.toLowerCase()}|${place.address.toLowerCase()}`;
  if (seen.has(key)) {
    continue;
  }
  seen.add(key);
  uniquePlaces.push(place);
}

const finalPlaces = uniquePlaces.map((place, index) => {
  const withMeta = {
    id: `place-${String(index + 1).padStart(3, "0")}`,
    ...place,
  };

  withMeta.description = categoryDescription(withMeta);
  withMeta.image = imageOverrides[withMeta.title] ?? "";
  withMeta.mapLink = mapLinkFor(withMeta);

  return withMeta;
});

const js = `export const places = ${JSON.stringify(finalPlaces, null, 2)};\n`;
await writeFile(outputPath, js);

const counts = finalPlaces.reduce((acc, place) => {
  acc[place.category] = (acc[place.category] ?? 0) + 1;
  return acc;
}, {});

console.log(JSON.stringify({ total: finalPlaces.length, counts }, null, 2));
