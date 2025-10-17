import React, { useMemo } from "react";
import { motion } from "framer-motion";

export default function Calendar({
  current,
  setCurrent,
  events,
  setEvents,
  selectedDate,
  setSelectedDate,
  startOfMonth,
  endOfMonth,
  addDays,
  formatISO,
}) {
  const monthGrid = useMemo(() => {
    const start = startOfMonth(current);
    const end = endOfMonth(current);
    const startDay = start.getDay();
    const daysInMonth = end.getDate();
    const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
    const firstCellDate = addDays(start, -startDay);
    return Array.from({ length: totalCells }, (_, i) => addDays(firstCellDate, i));
  }, [current]);

  const monthLabel = useMemo(
    () => current.toLocaleString(undefined, { month: "long", year: "numeric" }),
    [current]
  );

  function goMonth(offset) {
    setCurrent((c) => new Date(c.getFullYear(), c.getMonth() + offset, 1));
  }

  function handleAddEvent(date) {
    const title = prompt("Event title");
    if (!title) return;
    const time = prompt("Time (HH:MM)");
    const newEvent = { id: Math.random(), title, date, time: time || "" };
    setEvents((ev) => [...ev, newEvent].sort((a, b) => a.date.localeCompare(b.date)));
  }

  function removeEvent(id) {
    if (!confirm("Remove this event?")) return;
    setEvents((ev) => ev.filter((e) => e.id !== id));
  }

  const agendaForSelected = events.filter((e) => e.date === selectedDate);

  return (
    <div>

      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Diary</h1>
          <p className="text-sm text-slate-600">Keep track of agendas and orders.</p>
        </div>
      </header>

      {/* --- Main Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="lg:col-span-2">
          <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">{monthLabel}</div>
              <div className="space-x-1">
                <button
                  onClick={() => goMonth(-1)}
                  className="text-xs px-2 py-1 rounded hover:bg-slate-100"
                >
                  Prev
                </button>
                <button
                  onClick={() => goMonth(1)}
                  className="text-xs px-2 py-1 rounded hover:bg-slate-100"
                >
                  Next
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs text-slate-500 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center font-medium">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-sm">
              {monthGrid.map((d) => {
                const iso = formatISO(d);
                const inMonth = d.getMonth() === current.getMonth();
                const dayEvents = events.filter((e) => e.date === iso);
                const isSelected = selectedDate === iso;
                return (
                  <div
                    key={iso}
                    onClick={() => setSelectedDate(iso)}
                    className={`p-2 rounded-lg cursor-pointer min-h-[64px] border ${isSelected
                        ? "border-indigo-300 bg-indigo-50"
                        : "border-transparent"
                      } ${inMonth ? "" : "text-slate-400 opacity-60"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-xs font-medium">{d.getDate()}</div>
                      <button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          handleAddEvent(iso);
                        }}
                        className="text-[10px] px-1 py-0.5 rounded bg-slate-100 hover:bg-slate-200"
                      >
                        +
                      </button>
                    </div>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 2).map((e) => (
                        <div
                          key={e.id}
                          className="text-[10px] bg-indigo-100 rounded px-1 py-0.5 truncate"
                        >
                          {e.title}
                          {e.time ? ` • ${e.time}` : ""}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-slate-500">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
        <section className="lg:col-span-1 bg-white p-3 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">Agenda — {selectedDate}</div>
            <button
              onClick={() => setSelectedDate(formatISO(new Date()))}
              className="text-xs px-2 py-1 rounded hover:bg-slate-100"
            >
              Today
            </button>
          </div>
          {agendaForSelected.length === 0 ? (
            <div className="text-sm text-slate-500">
              No events. Click a date to add one.
            </div>
          ) : (
            <ul className="space-y-2">
              {agendaForSelected.map((e) => (
                <li
                  key={e.id}
                  className="p-2 border rounded flex justify-between items-start"
                >
                  <div>
                    <div className="text-sm font-medium">{e.title}</div>
                    <div className="text-xs text-slate-500">
                      {e.time || "All day"}
                    </div>
                  </div>
                  <button
                    onClick={() => removeEvent(e.id)}
                    className="text-red-500 text-xs"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <br />

        <aside className="lg:col-span-3">
          <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">Completed appointments today</div>

            </div>
            <p>
              0.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
