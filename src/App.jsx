import React, { useMemo, useState } from "react";
import { MoonStar, SunMedium } from "lucide-react";

const SYSTEMS = {
  chasadim: {
    label: "מערכת דחסדים",
    sefirot: ["חסד", "גבורה", "תפארת", "נצח", "הוד", "יסוד", "מלכות"],
    colors: {
      חסד: "#34C759",
      גבורה: "#FF6B6B",
      תפארת: "#F6C453",
      נצח: "#4A90E2",
      הוד: "#B07CFF",
      יסוד: "#35C9C8",
      מלכות: "#8B7E74",
    },
  },
  mochin: {
    label: "מערכת דמוחין",
    sefirot: ["חכמה", "בינה", "דעת", "חסד", "גבורה", "תפארת", "מלכות"],
    colors: {
      חכמה: "#5B8DEF",
      בינה: "#A66BFF",
      דעת: "#FF9F43",
      חסד: "#34C759",
      גבורה: "#FF6B6B",
      תפארת: "#F6C453",
      מלכות: "#8B7E74",
    },
  },
};

function getDayNumber(weekIndex, dayIndex) {
  return weekIndex * 7 + dayIndex + 1;
}

function getDayMeta(dayNumber, sefirot) {
  const zeroBased = dayNumber - 1;
  const weekIndex = Math.floor(zeroBased / 7);
  const dayIndex = zeroBased % 7;

  return {
    dayNumber,
    weekIndex,
    dayIndex,
    weekSefira: sefirot[weekIndex],
    daySefira: sefirot[dayIndex],
    label: `${sefirot[weekIndex]} ד${sefirot[dayIndex]}`,
  };
}

function buildBoardState(selectedDay, sefirot) {
  const filledMap = new Map();

  for (let currentDay = 1; currentDay <= selectedDay; currentDay += 1) {
    const current = getDayMeta(currentDay, sefirot);

    for (let columnIndex = 0; columnIndex < 7; columnIndex += 1) {
      const cellDayNumber = getDayNumber(current.dayIndex, columnIndex);
      const existing = filledMap.get(cellDayNumber) ?? new Set();
      existing.add(current.weekIndex);
      filledMap.set(cellDayNumber, existing);
    }
  }

  return Array.from({ length: 7 }, (_, weekIndex) => {
    return Array.from({ length: 7 }, (_, dayIndex) => {
      const cellDayNumber = getDayNumber(weekIndex, dayIndex);
      return {
        ...getDayMeta(cellDayNumber, sefirot),
        filledInnerIndexes: Array.from(filledMap.get(cellDayNumber) ?? []),
      };
    });
  });
}

function HeaderCell({ children, sefira, colors, darkMode = false }) {
  const color = sefira ? colors[sefira] : darkMode ? "#cbd5e1" : "#94a3b8";

  return (
    <div
      className={`flex h-7 items-center justify-center rounded-lg border px-1 text-[10px] font-bold shadow-sm ${
        darkMode ? "bg-slate-900" : "bg-white"
      }`}
      style={{
        borderColor: color,
        color: sefira ? color : darkMode ? "#cbd5e1" : "#475569",
      }}
    >
      {children}
    </div>
  );
}

function SelectorButton({ day, isSelected, onClick, sefirot, darkMode = false }) {
  const meta = getDayMeta(day, sefirot);

  return (
    <button
      onClick={() => onClick(day)}
      className={`group relative flex h-7 w-7 items-center justify-center rounded-md border text-[10px] font-bold transition duration-150 cursor-pointer ${
        isSelected
          ? darkMode
            ? "border-white bg-white text-slate-900 shadow-sm"
            : "border-slate-900 bg-slate-900 text-white shadow-sm"
          : darkMode
            ? "border-slate-600 bg-slate-900 text-slate-200 hover:-translate-y-[1px] hover:border-slate-400 hover:bg-slate-800 hover:shadow-sm active:translate-y-0 active:scale-95"
            : "border-slate-300 bg-white text-slate-700 hover:-translate-y-[1px] hover:border-slate-500 hover:bg-slate-50 hover:shadow-sm active:translate-y-0 active:scale-95"
      }`}
      title={`${day} לעומר — ${meta.label}`}
    >
      {day}
    </button>
  );
}

function InnerSefiraBox({ sefira, isFilled, isLast, colors }) {
  const color = colors[sefira];
  const letter = sefira.charAt(0);

  return (
    <div
      className={`flex items-center justify-center rounded-[6px] border text-[9px] font-bold transition ${
        isLast ? "col-span-3 mx-auto w-[32%]" : ""
      }`}
      style={{
        minHeight: "18px",
        borderColor: color,
        backgroundColor: isFilled ? color : "transparent",
        color: isFilled ? "white" : color,
      }}
      title={sefira}
    >
      {letter}
    </div>
  );
}

function DayCell({ cell, selectedDay, onSelect, colors, sefirot, darkMode = false }) {
  const isSelected = cell.dayNumber === selectedDay;
  const dayBorderColor = colors[cell.daySefira];
  const weekColor = colors[cell.weekSefira];

  return (
    <button
      onClick={() => onSelect(cell.dayNumber)}
      className={`flex h-[82px] min-w-0 flex-col rounded-xl border-[2px] p-1 text-right shadow-sm transition hover:shadow-md ${
        darkMode ? "bg-slate-900" : "bg-white"
      } ${isSelected ? (darkMode ? "ring-2 ring-white ring-offset-1" : "ring-2 ring-slate-900 ring-offset-1") : ""}`}
      style={{ borderColor: dayBorderColor }}
      title={`${cell.dayNumber} לעומר — ${cell.label}`}
    >
      <div className="mb-1 flex items-start justify-between gap-1">
        <div className={`text-[9px] font-bold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
          {cell.dayNumber}
        </div>
        <div className="min-w-0 text-[9px] font-semibold leading-tight">
          <span style={{ color: weekColor }}>{cell.weekSefira}</span>
          <span className={darkMode ? "text-slate-500" : "text-slate-400"}> ד</span>
          <span style={{ color: dayBorderColor }}>{cell.daySefira}</span>
        </div>
      </div>

      <div className="mt-0.5 grid grid-cols-3 gap-1">
        {sefirot.map((sefira, innerIndex) => (
          <InnerSefiraBox
            key={`${cell.dayNumber}-${sefira}`}
            sefira={sefira}
            isFilled={cell.filledInnerIndexes.includes(innerIndex)}
            isLast={innerIndex === 6}
            colors={colors}
          />
        ))}
      </div>
    </button>
  );
}

function RowFrame({ sefira, children, colors, darkMode = false }) {
  return (
    <div
      className={`rounded-2xl border-[3px] p-1.5 ${darkMode ? "bg-slate-900/60" : ""}`}
      style={{ borderColor: colors[sefira] }}
    >
      {children}
    </div>
  );
}

export default function OmerSefirotBoard() {
  const [selectedDay, setSelectedDay] = useState(1);
  const [activeSystem, setActiveSystem] = useState("chasadim");
  const [darkMode, setDarkMode] = useState(false);

  const system = SYSTEMS[activeSystem];
  const sefirot = system.sefirot;
  const colors = system.colors;

  const board = useMemo(() => buildBoardState(selectedDay, sefirot), [selectedDay, sefirot]);
  const selectedMeta = getDayMeta(selectedDay, sefirot);

  const pageBg = darkMode ? "bg-slate-950" : "bg-slate-100";
  const shellBg = darkMode ? "bg-slate-900 shadow-[0_10px_40px_rgba(0,0,0,0.35)]" : "bg-white shadow-sm";
  const panelBg = darkMode ? "bg-slate-800/90" : "bg-slate-50";
  const panelSoftBg = darkMode ? "bg-slate-800/70" : "bg-slate-50";
  const titleText = darkMode ? "text-slate-100" : "text-slate-900";
  const mainText = darkMode ? "text-slate-200" : "text-slate-700";
  const mutedText = darkMode ? "text-slate-400" : "text-slate-500";
  const buttonBase = "rounded-lg border px-3 py-1.5 text-xs font-bold transition duration-150 cursor-pointer hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0 active:scale-95";
  const buttonIdle = darkMode
    ? "border-slate-600 bg-slate-900 text-slate-200 hover:border-slate-400 hover:bg-slate-800"
    : "border-slate-300 bg-white text-slate-700 hover:border-slate-500 hover:bg-slate-50";
  const buttonActive = darkMode
    ? "border-white bg-white text-slate-900"
    : "border-slate-900 bg-slate-900 text-white";

  return (
    <div className={`h-screen overflow-hidden p-2 md:p-3 ${pageBg}`} dir="rtl">
      <div className={`mx-auto flex h-full max-w-[1400px] flex-col gap-2 rounded-[24px] p-3 ${shellBg}`}>
        <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl px-3 py-2.5 ${panelBg}`}>
          <div className="flex items-center gap-2">
            <h1 className={`text-lg font-bold md:text-xl ${titleText}`}>
              בניין הכוונות לפי 7 הספירות בספירת העומר
            </h1>
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className={`${buttonBase} ${buttonIdle} flex h-9 w-9 items-center justify-center rounded-full px-0 py-0 text-base`}
              title={darkMode ? "מעבר למצב יום" : "מעבר למצב חושך"}
              aria-label={darkMode ? "מעבר למצב יום" : "מעבר למצב חושך"}
            >
              {darkMode ? <SunMedium size={18} strokeWidth={2.2} /> : <MoonStar size={18} strokeWidth={2.2} />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSystem("mochin")}
              className={`${buttonBase} ${activeSystem === "mochin" ? buttonActive : buttonIdle}`}
            >
              מערכת דמוחין
            </button>
            <button
              onClick={() => setActiveSystem("chasadim")}
              className={`${buttonBase} ${activeSystem === "chasadim" ? buttonActive : buttonIdle}`}
            >
              מערכת דחסדים
            </button>
          </div>

          <div className="text-sm font-semibold leading-tight">
            <span className={mainText}>יום {selectedMeta.dayNumber} לעומר · </span>
            <span style={{ color: colors[selectedMeta.weekSefira] }}>{selectedMeta.weekSefira}</span>
            <span className={darkMode ? "text-slate-500" : "text-slate-400"}> ד</span>
            <span style={{ color: colors[selectedMeta.daySefira] }}>{selectedMeta.daySefira}</span>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[148px_minmax(0,1fr)] gap-3">
          <aside className={`rounded-2xl p-2.5 ${panelSoftBg} flex h-full flex-col`}>
            <div className={`mb-2 text-[13px] font-bold ${titleText}`}>ימי העומר</div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 49 }, (_, index) => index + 1).map((day) => (
                <SelectorButton
                  key={day}
                  day={day}
                  isSelected={day === selectedDay}
                  onClick={setSelectedDay}
                  sefirot={sefirot}
                  darkMode={darkMode}
                />
              ))}
            </div>

            <div className="mt-auto pt-3 text-center">
              <div className={`text-[11px] font-medium ${mutedText}`}>
                פותח על ידי גל דידי
              </div>
            </div>
          </aside>

          <section className={`min-h-0 rounded-2xl p-2.5 ${panelSoftBg}`}>
            <div className="grid h-full grid-rows-[28px_repeat(7,minmax(0,1fr))] gap-1.5">
              <div className="grid grid-cols-[54px_repeat(7,minmax(0,1fr))] gap-1.5">
                <HeaderCell darkMode={darkMode}>ש/י</HeaderCell>
                {sefirot.map((sefira) => (
                  <HeaderCell key={`header-${sefira}`} sefira={sefira} colors={colors} darkMode={darkMode}>
                    {sefira}
                  </HeaderCell>
                ))}
              </div>

              {board.map((row, weekIndex) => {
                const weekSefira = sefirot[weekIndex];

                return (
                  <RowFrame key={`row-${weekSefira}`} sefira={weekSefira} colors={colors} darkMode={darkMode}>
                    <div className="grid h-full grid-cols-[54px_repeat(7,minmax(0,1fr))] gap-1.5">
                      <div
                        className={`flex items-center justify-center rounded-xl border px-1 text-center text-[10px] font-bold ${
                          darkMode ? "bg-slate-900" : "bg-white"
                        }`}
                        style={{
                          color: colors[weekSefira],
                          borderColor: `${colors[weekSefira]}66`,
                        }}
                      >
                        {weekSefira}
                      </div>

                      {row.map((cell) => (
                        <DayCell
                          key={cell.dayNumber}
                          cell={cell}
                          selectedDay={selectedDay}
                          onSelect={setSelectedDay}
                          colors={colors}
                          sefirot={sefirot}
                          darkMode={darkMode}
                        />
                      ))}
                    </div>
                  </RowFrame>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
