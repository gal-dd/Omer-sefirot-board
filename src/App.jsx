import React, { useEffect, useMemo, useState } from "react";
import { Crown, MoonStar, SunMedium } from "lucide-react";
import { HDate, Location, Zmanim } from "@hebcal/core";

const HAIFA = Location.lookup("Haifa");
const OMER_START_5786 = new HDate(16, "Nisan", 5786);
const OMER_END_5786 = new HDate(5, "Sivan", 5786);

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

function numberToHebrewLetters(num) {
  const ones = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
  const tens = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
  const hundreds = ["", "ק", "ר", "ש", "ת"];

  let value = num;
  let result = "";

  while (value >= 400) {
    result += "ת";
    value -= 400;
  }

  if (value >= 100) {
    result += hundreds[Math.floor(value / 100)];
    value %= 100;
  }

  if (value === 15) {
    result += "טו";
    value = 0;
  } else if (value === 16) {
    result += "טז";
    value = 0;
  }

  if (value >= 10) {
    result += tens[Math.floor(value / 10)];
    value %= 10;
  }

  if (value > 0) {
    result += ones[value];
  }

  if (result.length <= 1) {
    return `${result}׳`;
  }

  return `${result.slice(0, -1)}״${result.slice(-1)}`;
}

function getHebrewMonthName(hdate) {
  const monthValue = hdate.getMonth();
  const monthNames = {
    1: "ניסן",
    2: "אייר",
    3: "סיוון",
    4: "תמוז",
    5: "אב",
    6: "אלול",
    7: "תשרי",
    8: "חשוון",
    9: "כסלו",
    10: "טבת",
    11: "שבט",
    12: "אדר",
    13: "אדר ב׳",
    Nisan: "ניסן",
    Iyyar: "אייר",
    Sivan: "סיוון",
    Tamuz: "תמוז",
    Tammuz: "תמוז",
    Av: "אב",
    Elul: "אלול",
    Tishrei: "תשרי",
    Cheshvan: "חשוון",
    Heshvan: "חשוון",
    Kislev: "כסלו",
    Tevet: "טבת",
    Shvat: "שבט",
    Shevat: "שבט",
    Adar: "אדר",
    "Adar I": "אדר א׳",
    "Adar II": "אדר ב׳",
  };

  return monthNames[monthValue] || monthNames[String(monthValue)] || String(monthValue);
}

function formatHebrewDate(hdate) {
  const day = numberToHebrewLetters(hdate.getDate());
  const month = getHebrewMonthName(hdate);
  const year = numberToHebrewLetters(hdate.getFullYear() % 1000);
  return `${day} ${month} ה${year}`;
}

function getIsraelNowParts() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(new Date()).filter((part) => part.type !== "literal").map((part) => [part.type, part.value])
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function getCurrentOmerSiteState() {
  const israelNow = getIsraelNowParts();
  const zmanimDate = new Date(Date.UTC(israelNow.year, israelNow.month - 1, israelNow.day, 12, 0, 0));
  const zmanim = new Zmanim(HAIFA, zmanimDate, false);
  const tzeit = zmanim.tzeit();

  const tzeitParts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jerusalem",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
      .formatToParts(tzeit)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  const nowInSeconds = israelNow.hour * 3600 + israelNow.minute * 60 + israelNow.second;
  const tzeitInSeconds = Number(tzeitParts.hour) * 3600 + Number(tzeitParts.minute) * 60 + Number(tzeitParts.second);

  const activeGregorianDate = new Date(Date.UTC(
    israelNow.year,
    israelNow.month - 1,
    israelNow.day + (nowInSeconds >= tzeitInSeconds ? 1 : 0),
    12,
    0,
    0
  ));

  const activeHDate = new HDate(activeGregorianDate);
  const isDuringOmer = activeHDate.abs() >= OMER_START_5786.abs() && activeHDate.abs() <= OMER_END_5786.abs();
  const selectedDay = isDuringOmer ? activeHDate.abs() - OMER_START_5786.abs() + 1 : 1;

  return {
    activeHDate,
    selectedDay,
    isDuringOmer,
  };
}

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
  const visibleMap = new Map();
  const selected = getDayMeta(selectedDay, sefirot);

  for (let currentDay = 1; currentDay <= selectedDay; currentDay += 1) {
    const current = getDayMeta(currentDay, sefirot);

    for (let columnIndex = 0; columnIndex < 7; columnIndex += 1) {
      const cellDayNumber = getDayNumber(current.dayIndex, columnIndex);
      const existing = visibleMap.get(cellDayNumber) ?? new Set();
      existing.add(current.weekIndex);
      visibleMap.set(cellDayNumber, existing);
    }
  }

  return Array.from({ length: 7 }, (_, weekIndex) => {
    return Array.from({ length: 7 }, (_, dayIndex) => {
      const cellDayNumber = getDayNumber(weekIndex, dayIndex);
      const visibleInnerIndexes = Array.from(visibleMap.get(cellDayNumber) ?? []).sort((a, b) => a - b);
      const activeInnerIndex = weekIndex === selected.dayIndex ? selected.weekIndex : null;

      return {
        ...getDayMeta(cellDayNumber, sefirot),
        visibleInnerIndexes,
        activeInnerIndex,
      };
    });
  });
}

function HeaderCell({ children, sefira, colors, darkMode = false }) {
  const color = sefira ? colors[sefira] : darkMode ? "#cbd5e1" : "#94a3b8";

  return (
    <div
      className={`flex min-h-[34px] items-center justify-center rounded-xl border px-1.5 text-[11px] font-bold shadow-sm ${
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
      className={`group relative flex aspect-square min-h-[32px] min-w-[32px] items-center justify-center rounded-lg border text-[11px] font-bold transition duration-150 cursor-pointer ${
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
      className={`flex items-center justify-center rounded-[8px] border text-[10px] font-bold transition ${
        isLast ? "col-span-3 mx-auto w-[34%]" : ""
      }`}
      style={{
        minHeight: "22px",
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
      className={`flex aspect-[1.08/1] min-w-0 flex-col rounded-2xl border-[2px] p-1.5 text-right shadow-sm transition hover:shadow-md ${
        darkMode ? "bg-slate-900" : "bg-white"
      } ${isSelected ? (darkMode ? "ring-4 ring-white ring-offset-2 shadow-[0_0_0_2px_rgba(255,255,255,0.12)]" : "ring-4 ring-slate-900 ring-offset-2 shadow-[0_0_0_2px_rgba(15,23,42,0.08)]") : ""}`}
      style={{ borderColor: dayBorderColor }}
      title={`${cell.dayNumber} לעומר — ${cell.label}`}
    >
      <div className="mb-1 flex items-start justify-between gap-1">
        <div className={`text-[10px] font-bold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
          {cell.dayNumber}
        </div>
        <div className="min-w-0 text-[10px] font-semibold leading-tight">
          <span style={{ color: weekColor }}>{cell.weekSefira}</span>
          <span className={darkMode ? "text-slate-500" : "text-slate-400"}> ד</span>
          <span style={{ color: dayBorderColor }}>{cell.daySefira}</span>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-1">
        {sefirot
          .map((sefira, innerIndex) => ({ sefira, innerIndex }))
          .filter(({ innerIndex }) => cell.visibleInnerIndexes.includes(innerIndex))
          .map(({ sefira, innerIndex }) => (
            <InnerSefiraBox
              key={`${cell.dayNumber}-${sefira}`}
              sefira={sefira}
              isFilled={cell.activeInnerIndex === innerIndex}
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
      className={`rounded-[22px] border-[3px] p-2 ${darkMode ? "bg-slate-900/60" : ""}`}
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
  const [siteDateInfo, setSiteDateInfo] = useState(() => getCurrentOmerSiteState());

  const system = SYSTEMS[activeSystem];
  const sefirot = system.sefirot;
  const colors = system.colors;

  useEffect(() => {
    const updateState = () => {
      const current = getCurrentOmerSiteState();
      setSiteDateInfo(current);
      if (current.isDuringOmer) {
        setSelectedDay(current.selectedDay);
      }
    };

    updateState();
    const timer = window.setInterval(updateState, 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const board = useMemo(() => buildBoardState(selectedDay, sefirot), [selectedDay, sefirot]);
  const selectedMeta = getDayMeta(selectedDay, sefirot);
  const hebrewDateLabel = formatHebrewDate(siteDateInfo.activeHDate);
  const crownedRowIndexes = activeSystem === "mochin"
    ? Array.from({ length: 7 }, (_, index) => index).filter(
        (index) => selectedDay >= (index + 1) * 7
      )
    : [];

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
    <div className={`min-h-screen ${pageBg}`} dir="rtl">
      <div className="mx-auto max-w-[1600px] p-2 md:p-3 lg:p-4">
        <div className={`flex min-h-[100dvh] flex-col gap-3 rounded-[24px] p-3 ${shellBg}`}>
          <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl px-3 py-2.5 ${panelBg}`}>
            <div className="flex items-center gap-2">
              <h1 className={`text-base font-bold md:text-lg xl:text-xl ${titleText}`}>
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

            <div className="flex flex-wrap items-center gap-2">
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

            <div className="text-sm font-semibold leading-tight md:text-base">
              <div>
                <span className={mainText}>יום {selectedMeta.dayNumber} לעומר · </span>
                <span style={{ color: colors[selectedMeta.weekSefira] }}>{selectedMeta.weekSefira}</span>
                <span className={darkMode ? "text-slate-500" : "text-slate-400"}> ד</span>
                <span style={{ color: colors[selectedMeta.daySefira] }}>{selectedMeta.daySefira}</span>
              </div>
              <div className={`mt-1 text-xs font-medium ${mutedText}`}>
                {hebrewDateLabel}
              </div>
            </div>
          </div>

          <div className="grid flex-1 gap-3 xl:grid-cols-[220px_minmax(0,1fr)]">
            <aside className={`rounded-2xl p-3 ${panelSoftBg} flex flex-col`}>
              <div className={`mb-3 text-sm font-bold ${titleText}`}>ימי העומר</div>
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 xl:grid-cols-4 2xl:grid-cols-7">
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

              <div className="mt-auto pt-4 text-center xl:pt-6">
                <div className={`text-[11px] font-medium ${mutedText}`}>
                  פותח על ידי גל דידי
                </div>
              </div>
            </aside>

            <section className={`min-w-0 rounded-2xl p-2 sm:p-3 ${panelSoftBg}`}>
              <div className="overflow-x-auto">
                <div className="mx-auto min-w-[880px] max-w-[1180px]">
                  <div className="grid gap-2" style={{ gridTemplateColumns: "72px repeat(7, minmax(0, 1fr))" }}>
                    <HeaderCell darkMode={darkMode}>ש/י</HeaderCell>
                    {sefirot.map((sefira) => (
                      <HeaderCell key={`header-${sefira}`} sefira={sefira} colors={colors} darkMode={darkMode}>
                        {sefira}
                      </HeaderCell>
                    ))}
                  </div>

                  <div className="mt-2 space-y-2.5">
                    {board.map((row, weekIndex) => {
                      const weekSefira = sefirot[weekIndex];

                      return (
                        <RowFrame key={`row-${weekSefira}`} sefira={weekSefira} colors={colors} darkMode={darkMode}>
                          <div className="grid items-stretch gap-2" style={{ gridTemplateColumns: "72px repeat(7, minmax(0, 1fr))" }}>
                            <div
                              className={`flex items-center justify-center rounded-2xl border px-1 text-center text-[11px] font-bold ${
                                darkMode ? "bg-slate-900" : "bg-white"
                              }`}
                              style={{
                                color: colors[weekSefira],
                                borderColor: `${colors[weekSefira]}66`,
                              }}
                            >
                              <div className="relative inline-flex items-center justify-center">
                                {crownedRowIndexes.includes(weekIndex) && (
                                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                    <Crown
                                      size={16}
                                      strokeWidth={2.4}
                                      fill="#f4c542"
                                      color="#d4a017"
                                    />
                                  </div>
                                )}
                                <span>{weekSefira}</span>
                              </div>
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
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
