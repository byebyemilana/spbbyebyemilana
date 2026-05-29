"use client";

import { useMemo, useState } from "react";
import { places } from "./places";

const categories = [
  { id: "all", label: "все" },
  { id: "поесть", label: "поесть" },
  { id: "выпить", label: "выпить" },
  { id: "посмотреть", label: "посмотреть" },
  { id: "расслабиться", label: "расслабиться" },
];

const lineFilters = [
  { id: "all", label: "все ветки", short: "все", emoji: "⌁", color: "#2d2721" },
  { id: "красная", label: "красная", short: "красная", emoji: "🔴", color: "#ef4a3f" },
  { id: "синяя", label: "синяя", short: "синяя", emoji: "🔵", color: "#0878be" },
  { id: "зеленая", label: "зеленая", short: "зеленая", emoji: "🟢", color: "#15995c" },
  { id: "оранжевая", label: "оранжевая", short: "оранжевая", emoji: "🟠", color: "#f28b2e" },
  { id: "фиолетовая", label: "фиолетовая", short: "фиолетовая", emoji: "🟣", color: "#8960c8" },
  { id: "область", label: "область", short: "область", emoji: "🚆", color: "#736957" },
  { id: "доставка", label: "доставка", short: "доставка", emoji: "🛵", color: "#b76647" },
  { id: "уточнить", label: "уточнить", short: "уточнить", emoji: "❔", color: "#8f806f" },
  { id: "другое", label: "другое", short: "другое", emoji: "·", color: "#2d2721" },
];

const lineOrder = lineFilters.map((line) => line.id).filter((id) => id !== "all");
const lineMeta = Object.fromEntries(lineFilters.map((line) => [line.id, line]));

const categoryStyles = {
  поесть: { bg: "#fee16b", text: "#2d2721" },
  выпить: { bg: "#78cbe6", text: "#2d2721" },
  посмотреть: { bg: "#ff7b49", text: "#2d2721" },
  расслабиться: { bg: "#77c968", text: "#2d2721" },
};

const heroStats = [
  { label: "мест", getValue: () => places.length, color: "#fee16b" },
  {
    label: "поесть",
    getValue: (counts) => counts["поесть"] ?? 0,
    color: "#ff7b49",
  },
  {
    label: "посмотреть",
    getValue: (counts) => counts["посмотреть"] ?? 0,
    color: "#78cbe6",
  },
];

const metroPaths = [
  {
    id: "красная",
    label: "красная",
    path: "M58 82 C128 76 179 111 236 135 C303 164 374 177 462 214",
    buttonPosition: { left: "6%", top: "9%" },
  },
  {
    id: "синяя",
    label: "синяя",
    path: "M54 238 C128 225 182 189 238 169 C302 146 366 122 462 92",
    buttonPosition: { left: "75%", top: "17%" },
  },
  {
    id: "зеленая",
    label: "зеленая",
    path: "M54 176 C130 183 202 174 260 158 C325 142 383 151 466 162",
    buttonPosition: { left: "6%", top: "47%" },
  },
  {
    id: "оранжевая",
    label: "оранжевая",
    path: "M262 44 C274 91 279 120 282 156 C288 198 299 235 318 278",
    buttonPosition: { left: "51%", top: "5%" },
  },
  {
    id: "фиолетовая",
    label: "фиолетовая",
    path: "M96 48 C145 91 184 123 244 151 C303 178 354 213 418 262",
    buttonPosition: { left: "66%", top: "80%" },
  },
];

const stationDots = [
  { x: 58, y: 82 },
  { x: 156, y: 103 },
  { x: 236, y: 135 },
  { x: 372, y: 177 },
  { x: 462, y: 214 },
  { x: 54, y: 238 },
  { x: 170, y: 196 },
  { x: 238, y: 169 },
  { x: 372, y: 122 },
  { x: 462, y: 92 },
  { x: 54, y: 176 },
  { x: 178, y: 174 },
  { x: 260, y: 158, hub: true },
  { x: 378, y: 151 },
  { x: 466, y: 162 },
  { x: 262, y: 44 },
  { x: 279, y: 120 },
  { x: 288, y: 198 },
  { x: 318, y: 278 },
  { x: 96, y: 48 },
  { x: 184, y: 123 },
  { x: 354, y: 213 },
  { x: 418, y: 262 },
];

const recommendations = [
  {
    title: "Винтажное утро",
    text: "Уделка, Добро на Пионерской и Удельный парк: лучше начинать пораньше и оставить запас на находки.",
    line: "синяя",
    category: "посмотреть",
    accent: "#0878be",
  },
  {
    title: "Литейный без спешки",
    text: "Анненкирхе, Таврический сад, Мозаичный дворик, потом Kaiju или Ossu на еду.",
    line: "красная",
    category: "посмотреть",
    accent: "#ef4a3f",
  },
  {
    title: "Елагин после шоппинга",
    text: "Крестовский, Приморский парк и Елагин остров хорошо работают как спокойный вечерний маршрут.",
    line: "фиолетовая",
    category: "расслабиться",
    accent: "#8960c8",
  },
  {
    title: "В.О. арт + залив",
    text: "Артмуза, Эрарта и Севкабель: маршрут на несколько часов, где легко добавить еду рядом.",
    line: "оранжевая",
    category: "посмотреть",
    accent: "#f28b2e",
  },
];

function normalize(value) {
  return value.toLowerCase().replaceAll("ё", "е");
}

function getPlaceLines(place) {
  return place.lines?.length ? place.lines : ["другое"];
}

function placeMatchesQuery(place, preparedQuery) {
  if (!preparedQuery) {
    return true;
  }

  const searchable = normalize(
    [
      place.title,
      place.description,
      place.address,
      place.lineLabel,
      place.sourceSection,
      getPlaceLines(place).join(" "),
      place.tags.join(" "),
    ].join(" "),
  );

  return searchable.includes(preparedQuery);
}

function placeMatchesLine(place, activeLine) {
  return activeLine === "all" || getPlaceLines(place).includes(activeLine);
}

function groupByLine(list, activeLine) {
  if (activeLine !== "all") {
    return [
      {
        line: lineMeta[activeLine] ?? lineMeta["другое"],
        places: list,
      },
    ];
  }

  return lineOrder
    .map((lineId) => ({
      line: lineMeta[lineId] ?? lineMeta["другое"],
      places: list.filter((place) => (place.linePrimary ?? "другое") === lineId),
    }))
    .filter((group) => group.places.length > 0);
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeLine, setActiveLine] = useState("all");
  const [query, setQuery] = useState("");

  const baseCounts = useMemo(
    () =>
      places.reduce(
        (acc, place) => {
          acc.all += 1;
          acc[place.category] = (acc[place.category] ?? 0) + 1;
          return acc;
        },
        { all: 0 },
      ),
    [],
  );

  const preparedQuery = normalize(query.trim());

  const categoryCounts = useMemo(
    () =>
      places.reduce(
        (acc, place) => {
          if (!placeMatchesLine(place, activeLine) || !placeMatchesQuery(place, preparedQuery)) {
            return acc;
          }

          acc.all += 1;
          acc[place.category] = (acc[place.category] ?? 0) + 1;
          return acc;
        },
        { all: 0 },
      ),
    [activeLine, preparedQuery],
  );

  const lineCounts = useMemo(
    () =>
      places.reduce((acc, place) => {
        const categoryMatches =
          activeCategory === "all" || place.category === activeCategory;

        if (!categoryMatches || !placeMatchesQuery(place, preparedQuery)) {
          return acc;
        }

        for (const line of getPlaceLines(place)) {
          acc[line] = (acc[line] ?? 0) + 1;
        }

        return acc;
      }, {}),
    [activeCategory, preparedQuery],
  );

  const lineTotalCount = useMemo(
    () =>
      places.filter((place) => {
        const categoryMatches =
          activeCategory === "all" || place.category === activeCategory;

        return categoryMatches && placeMatchesQuery(place, preparedQuery);
      }).length,
    [activeCategory, preparedQuery],
  );

  const filteredPlaces = useMemo(
    () =>
      places.filter((place) => {
        const categoryMatches =
          activeCategory === "all" || place.category === activeCategory;

        return (
          categoryMatches &&
          placeMatchesLine(place, activeLine) &&
          placeMatchesQuery(place, preparedQuery)
        );
      }),
    [activeCategory, activeLine, preparedQuery],
  );

  const groupedPlaces = useMemo(
    () => groupByLine(filteredPlaces, activeLine),
    [filteredPlaces, activeLine],
  );

  const selectedLine = lineMeta[activeLine] ?? lineMeta["all"];

  function activateLine(lineId, categoryId) {
    setActiveLine(lineId);

    if (categoryId) {
      setActiveCategory(categoryId);
    }

    requestAnimationFrame(() => {
      document.getElementById("places")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f0df] text-ink">
      <section className="relative px-4 pb-10 pt-4 sm:px-8 lg:px-12">
        <div className="geo-grid absolute inset-0 opacity-55" aria-hidden="true" />
        <div className="absolute left-4 top-24 h-24 w-24 rotate-12 bg-[#fb69ae] riso-shape shape-arch sm:left-16" aria-hidden="true" />
        <div className="absolute right-6 top-20 h-24 w-24 bg-[#ff7b49] riso-shape shape-burst sm:right-20 sm:h-32 sm:w-32" aria-hidden="true" />
        <div className="absolute bottom-10 left-[48%] hidden h-28 w-28 -rotate-12 bg-[#77c968] riso-shape shape-star lg:block" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl">
          <nav className="flex items-center justify-between border-b-2 border-ink pb-4">
            <a href="#places" className="text-sm uppercase tracking-[0.22em]">
              spb guide
            </a>
            <a
              href="https://t.me/byebyemilana"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border-2 border-ink bg-cream px-4 py-2 text-sm shadow-[3px_3px_0_#2d2721] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#2d2721]"
            >
              @byebyemilana
            </a>
          </nav>

          <div className="grid min-h-[78svh] gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_29rem] lg:items-center">
            <div className="max-w-4xl">
              <p className="w-fit rounded-full border-2 border-ink bg-[#fee16b] px-4 py-2 text-xs uppercase tracking-[0.18em] shadow-[3px_3px_0_#2d2721]">
                личная карта мест
              </p>
              <h1 className="mt-8 max-w-5xl font-display text-6xl leading-[0.86] tracking-normal sm:text-8xl lg:text-9xl">
                Петербург по веткам метро
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-7 text-ink/72 sm:text-xl sm:leading-8">
                Авторский мини-гайд без туристической открытки: еда, кофе,
                прогулки, винтаж, книги и область разложены как слои городской карты.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {heroStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border-2 border-ink bg-cream px-5 py-4 shadow-[4px_4px_0_#2d2721]"
                  >
                    <p
                      className="font-display text-5xl leading-none"
                      style={{ color: stat.color }}
                    >
                      {stat.getValue(baseCounts)}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink/56">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="geo-panel riso-texture rounded-lg border-2 border-ink bg-cream p-4 shadow-[8px_8px_0_#2d2721] sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/46">
                    metro layers
                  </p>
                  <h2 className="mt-2 font-display text-4xl leading-none">
                    Смотри по цвету ветки
                  </h2>
                </div>
                <span className="rounded-full border-2 border-ink bg-[#78cbe6] px-3 py-1 text-sm">
                  5 линий
                </span>
              </div>

              <div className="relative mt-6 overflow-hidden rounded-md border-2 border-ink bg-[#fbf5e8]">
                <div className="map-paper absolute inset-0" aria-hidden="true" />
                <svg
                  viewBox="0 0 520 320"
                  className="relative z-10 h-80 w-full"
                  aria-hidden="true"
                >
                  <rect x="0" y="0" width="520" height="320" fill="transparent" />

                  {metroPaths.map((metroPath) => {
                    const meta = lineMeta[metroPath.id];
                    const isActive =
                      activeLine === "all" || activeLine === metroPath.id;

                    return (
                      <g
                        key={metroPath.id}
                        className="metro-map-group"
                      >
                        <path
                          d={metroPath.path}
                          fill="none"
                          stroke="#2d2721"
                          strokeWidth="16"
                          strokeLinecap="round"
                          opacity={isActive ? 1 : 0.22}
                        />
                        <path
                          d={metroPath.path}
                          fill="none"
                          stroke={meta.color}
                          strokeWidth={isActive ? 10 : 7}
                          strokeLinecap="round"
                          opacity={isActive ? 1 : 0.32}
                        />
                      </g>
                    );
                  })}

                  {stationDots.map((dot) => (
                    <circle
                      key={`${dot.x}-${dot.y}`}
                      cx={dot.x}
                      cy={dot.y}
                      r={dot.hub ? 12 : 7}
                      fill={dot.hub ? "#fffaf0" : "#fbf5e8"}
                      stroke="#2d2721"
                      strokeWidth={dot.hub ? 4 : 3}
                    />
                  ))}
                </svg>

                {metroPaths.map((metroPath) => {
                  const meta = lineMeta[metroPath.id];
                  const isActive = activeLine === metroPath.id;

                  return (
                    <button
                      key={metroPath.id}
                      type="button"
                      onClick={() => activateLine(metroPath.id)}
                      aria-label={`выбрать ветку ${metroPath.label}`}
                      className="metro-map-button absolute z-20 rounded-full border-2 border-ink bg-cream px-3 py-1 text-xs uppercase tracking-[0.08em] transition hover:-translate-y-0.5"
                      style={{
                        ...metroPath.buttonPosition,
                        backgroundColor: isActive ? meta.color : "#fffaf0",
                        color: isActive ? "#fffaf0" : "#2d2721",
                        boxShadow: isActive ? "3px 3px 0 #2d2721" : "2px 2px 0 rgba(45,39,33,0.2)",
                      }}
                    >
                      {metroPath.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                {lineFilters.slice(1, 6).map((line) => {
                  const isActive = activeLine === line.id;

                  return (
                    <button
                      key={line.id}
                      type="button"
                      onClick={() => activateLine(line.id)}
                      className="flex items-center gap-2 rounded-md border border-ink/18 bg-white/45 px-3 py-2 text-left text-sm transition hover:-translate-y-0.5"
                      style={{
                        boxShadow: isActive ? "3px 3px 0 #2d2721" : "none",
                        borderColor: isActive ? "#2d2721" : "rgba(45,39,33,0.18)",
                      }}
                    >
                      <span
                        className="h-3 w-3 rounded-full border border-ink/20"
                        style={{ backgroundColor: line.color }}
                      />
                      <span>{line.short}</span>
                    </button>
                  );
                })}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl border-y-2 border-ink py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink/46">
                мои рекомендации
              </p>
              <h2 className="mt-2 font-display text-4xl leading-none sm:text-5xl">
                С чего бы я начала
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-ink/58">
              Я бы держала эти сценарии как быстрые стартовые точки, когда не
              хочется снова выбирать из двухсот мест.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {recommendations.map((recommendation, index) => {
              const line = lineMeta[recommendation.line];

              return (
                <article
                  key={recommendation.title}
                  className="relative overflow-hidden rounded-lg border-2 border-ink bg-cream p-5 shadow-[5px_5px_0_rgba(45,39,33,0.18)]"
                >
                  <span
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink font-display text-2xl"
                    style={{ backgroundColor: recommendation.accent, color: "#fffaf0" }}
                  >
                    {index + 1}
                  </span>
                  <p className="text-sm text-ink/52">
                    {line.emoji} {line.label} · {recommendation.category}
                  </p>
                  <h3 className="mt-5 pr-12 font-display text-3xl leading-none">
                    {recommendation.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-ink/64">
                    {recommendation.text}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      activateLine(recommendation.line, recommendation.category)
                    }
                    aria-label={`рекомендация ${recommendation.title}`}
                    className="mt-5 rounded-full border-2 border-ink bg-white px-4 py-2 text-sm transition hover:-translate-y-0.5 hover:bg-ink hover:text-cream"
                  >
                    открыть подборку
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="places" className="relative px-4 pb-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="sticky top-0 z-20 -mx-4 border-y-2 border-ink bg-[#f8f0df]/94 px-4 py-4 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
            <div className="mx-auto grid max-w-7xl gap-4 xl:grid-cols-[minmax(0,1fr)_30rem] xl:items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink/46">
                  фильтр карты
                </p>
                <h2 className="mt-2 font-display text-4xl leading-none sm:text-5xl">
                  {selectedLine.id === "all"
                    ? "Все места по веткам"
                    : `${selectedLine.emoji} ${selectedLine.label}`}
                </h2>
              </div>

              <div className="flex flex-col gap-3">
                <label className="sr-only" htmlFor="place-search">
                  Поиск по местам
                </label>
                <input
                  id="place-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="поиск: метро, место, тег, адрес"
                  className="h-12 rounded-lg border-2 border-ink bg-cream px-4 text-base outline-none shadow-[3px_3px_0_#2d2721] transition placeholder:text-ink/38 focus:-translate-y-0.5 focus:shadow-[5px_5px_0_#2d2721]"
                />

                <div className="flex gap-2 overflow-x-auto pb-1">
                  {categories.map((category) => {
                    const isActive = activeCategory === category.id;
                    const style = categoryStyles[category.id] ?? {
                      bg: "#2d2721",
                      text: "#fffaf0",
                    };

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setActiveCategory(category.id)}
                        aria-label={`категория ${category.label}`}
                        className="shrink-0 rounded-full border-2 border-ink px-4 py-2 text-sm transition hover:-translate-y-0.5"
                        style={{
                          backgroundColor: isActive ? style.bg : "#fffaf0",
                          color: isActive ? style.text : "#2d2721",
                          boxShadow: isActive ? "3px 3px 0 #2d2721" : "none",
                        }}
                      >
                        {category.label}
                        <span className="ml-2 opacity-55">
                          {categoryCounts[category.id] ?? 0}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mx-auto mt-4 flex max-w-7xl gap-2 overflow-x-auto pb-1">
              {lineFilters.map((line) => {
                const isActive = activeLine === line.id;
                const count = line.id === "all" ? lineTotalCount : lineCounts[line.id] ?? 0;

                return (
                  <button
                    key={line.id}
                    type="button"
                    onClick={() => setActiveLine(line.id)}
                    aria-label={`ветка ${line.label}`}
                    className="shrink-0 rounded-full border-2 px-4 py-2 text-sm transition hover:-translate-y-0.5"
                    style={{
                      borderColor: "#2d2721",
                      backgroundColor: isActive ? line.color : "#fffaf0",
                      color: isActive ? "#fffaf0" : "#2d2721",
                      boxShadow: isActive ? "3px 3px 0 #2d2721" : "none",
                    }}
                  >
                    <span className="mr-2">{line.emoji}</span>
                    {line.short}
                    <span className="ml-2 opacity-65">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink pb-4 text-sm">
            <p>{filteredPlaces.length} мест</p>
            <p className="text-ink/56">
              {activeCategory === "all" ? "все категории" : activeCategory} ·{" "}
              {selectedLine.id === "all" ? "все ветки" : selectedLine.label}
            </p>
          </div>

          {groupedPlaces.length ? (
            <div className="mt-8 space-y-10">
              {groupedPlaces.map((group) => (
                <section key={group.line.id} aria-labelledby={`${group.line.id}-title`}>
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-ink/42">
                        metro line
                      </p>
                      <h3
                        id={`${group.line.id}-title`}
                        className="mt-1 font-display text-4xl leading-none sm:text-5xl"
                      >
                        {group.line.emoji} {group.line.label}
                      </h3>
                    </div>
                    <span
                      className="rounded-full border-2 border-ink px-4 py-2 text-sm shadow-[3px_3px_0_#2d2721]"
                      style={{ backgroundColor: group.line.color, color: "#fffaf0" }}
                    >
                      {group.places.length}
                    </span>
                  </div>

                  <div className="metro-card-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {group.places.map((place, index) => {
                      const primaryLine = lineMeta[place.linePrimary] ?? lineMeta["другое"];
                      const categoryStyle = categoryStyles[place.category] ?? categoryStyles["посмотреть"];

                      return (
                        <article
                          key={place.id}
                          className="group relative overflow-hidden rounded-lg border-2 border-ink bg-cream p-4 shadow-[5px_5px_0_rgba(45,39,33,0.18)] transition hover:-translate-y-1 hover:shadow-[8px_8px_0_rgba(45,39,33,0.22)]"
                        >
                          <div
                            className="absolute right-3 top-3 h-10 w-10 riso-shape opacity-90"
                            style={{
                              backgroundColor: primaryLine.color,
                              clipPath:
                                index % 3 === 0
                                  ? "polygon(50% 0%, 61% 37%, 100% 50%, 61% 63%, 50% 100%, 39% 63%, 0% 50%, 39% 37%)"
                                  : index % 3 === 1
                                    ? "polygon(50% 0%, 58% 32%, 86% 14%, 68% 42%, 100% 50%, 68% 58%, 86% 86%, 58% 68%, 50% 100%, 42% 68%, 14% 86%, 32% 58%, 0% 50%, 32% 42%, 14% 14%, 42% 32%)"
                                    : "inset(0 round 48% 34% 46% 28%)",
                            }}
                            aria-hidden="true"
                          />

                          <div className="relative pr-12">
                            <div className="mb-4 flex flex-wrap gap-2">
                              <span
                                className="rounded-full border border-ink/18 px-3 py-1 text-xs"
                                style={{
                                  backgroundColor: categoryStyle.bg,
                                  color: categoryStyle.text,
                                }}
                              >
                                {place.category}
                              </span>
                              <span className="rounded-full border border-ink/14 bg-white/55 px-3 py-1 text-xs text-ink/62">
                                {place.sourceSection}
                              </span>
                            </div>

                            {place.image ? (
                              <div className="mb-4 aspect-[4/3] overflow-hidden rounded-md border-2 border-ink bg-[#f1e4cf]">
                                <img
                                  src={place.image}
                                  alt={place.title}
                                  loading="lazy"
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : null}

                            <h4 className="font-display text-3xl leading-[0.96]">
                              {place.title}
                            </h4>
                            <p className="card-description mt-3 text-sm leading-6 text-ink/62">
                              {place.description}
                            </p>
                          </div>

                          <div className="mt-5 space-y-2 border-t border-ink/12 pt-4 text-sm text-ink/68">
                            <p>{place.lineLabel}</p>
                            <p>{place.address}</p>
                          </div>

                          <div className="mt-5 flex items-center justify-between gap-3">
                            <div className="flex flex-wrap gap-2">
                              {place.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-[#f1e4cf] px-3 py-1 text-xs text-ink/58"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <a
                              href={place.mapLink}
                              target="_blank"
                              rel="noreferrer"
                              className="shrink-0 rounded-full border-2 border-ink bg-white px-3 py-1 text-xs transition hover:bg-ink hover:text-cream"
                              aria-label={`Открыть ${place.title} на карте`}
                            >
                              карта
                            </a>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-lg border-2 border-ink bg-cream p-8 text-ink/58 shadow-[5px_5px_0_#2d2721]">
              Ничего не нашлось. Попробуй другое название, метро или тег.
            </div>
          )}
        </div>
      </section>

      <footer className="border-t-2 border-ink px-4 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-ink/62 sm:flex-row sm:items-center sm:justify-between">
          <p>Собрано как личный городской zine: место, ветка, адрес, карта.</p>
          <a
            href="https://t.me/byebyemilana"
            target="_blank"
            rel="noreferrer"
            className="w-fit border-b-2 border-ink pb-1 text-ink transition hover:text-[#ef4a3f]"
          >
            @byebyemilana
          </a>
        </div>
      </footer>
    </main>
  );
}
