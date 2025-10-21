import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Plus } from "lucide-react";

export default function Calendar({
  current,
  setCurrent,
  selectedDate,
  setSelectedDate,
  startOfMonth,
  endOfMonth,
  addDays,
  formatISO,
}) {
  const [events, setEvents] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [newAgenda, setNewAgenda] = useState({ title: "", time: "00:00", status_id: "" });
  const [newStatus, setNewStatus] = useState("");
  const [agendaDate, setAgendaDate] = useState("");

  const saved = JSON.parse(localStorage.getItem("user"));
  const companyName = saved?.company_name?.toLowerCase();

  const monthLabel = useMemo(
    () => current.toLocaleString(undefined, { month: "long", year: "numeric" }),
    [current]
  );

  const monthGrid = useMemo(() => {
    const start = startOfMonth(current);
    const end = endOfMonth(current);
    const startDay = start.getDay();
    const daysInMonth = end.getDate();
    const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
    const firstCellDate = addDays(start, -startDay);
    return Array.from({ length: totalCells }, (_, i) => addDays(firstCellDate, i));
  }, [current]);

  const goMonth = (offset) => setCurrent((c) => new Date(c.getFullYear(), c.getMonth() + offset, 1));

  // --- Fetch statuses ---
  useEffect(() => {
    if (!companyName) return;
    axios.get(`https://franklin-unsprinkled-corrie.ngrok-free.dev/api/status/${companyName}`, {
      headers: { "ngrok-skip-browser-warning": "true" }
    })
    .then(res => { if (res.data.success) setStatuses(res.data.statuses); })
    .catch(err => console.error(err));
  }, [companyName]);

  // --- Fetch calendar events ---
  useEffect(() => {
    if (!companyName) return;
    axios.get(`https://franklin-unsprinkled-corrie.ngrok-free.dev/api/calendar/${companyName}`, {
      headers: { "ngrok-skip-browser-warning": "true" }
    })
    .then(res => {
      if (res.data.success) {
        const dbEvents = res.data.entries.map(e => ({
          id: e.id,
          title: e.agenda,
          date: e.date,
          time: e.time,
          status_id: e.status_id,
          status_desc: e.status_desc
        }));
        setEvents(dbEvents);
      }
    })
    .catch(err => console.error(err));
  }, [companyName]);

  // --- Open Agenda Modal ---
  const handleOpenAgendaModal = (date) => {
    setAgendaDate(date);
    setNewAgenda({ title: "", time: "00:00", status_id: "" });
    setShowAgendaModal(true);
  };

  // --- Save Agenda to backend ---
  const handleSaveAgenda = async () => {
    if (!newAgenda.title) return alert("Please enter a title");

    try {
      const res = await axios.post(
        `https://franklin-unsprinkled-corrie.ngrok-free.dev/api/calendar/${companyName}`,
        {
          agenda: newAgenda.title,
          time: newAgenda.time,
          status_id: newAgenda.status_id || null,
          date: agendaDate
        },
        { headers: { "ngrok-skip-browser-warning": "true" } }
      );

      if (res.data.success) {
        const e = res.data.status;
        setEvents(ev => [...ev, {
          id: e.id,
          title: e.agenda,
          date: e.date,
          time: e.time,
          status_id: e.status_id,
          status_desc: e.status_desc
        }].sort((a, b) => a.date.localeCompare(b.date)));

        setShowAgendaModal(false);
      } else {
        alert("Failed to save agenda");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving agenda");
    }
  };

  const handleSaveStatus = async () => {
    if (!newStatus.trim()) return alert("Enter a status description");

    try {
      const res = await axios.post(
        `https://franklin-unsprinkled-corrie.ngrok-free.dev/api/status/${companyName}`,
        { status_desc: newStatus },
        { headers: { "ngrok-skip-browser-warning": "true" } }
      );

      if (res.data.success) {
        setStatuses(prev => [...prev, res.data.status]);
        setShowStatusModal(false);
        setNewStatus("");
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteStatus = async (statusId, statusDesc) => {
    const confirmed = confirm(`Please note status can only be deleted if it's not used in the diary.\nAre you sure you want to delete "${statusDesc}"?`);
    if (!confirmed) return;

    try {
      const res = await axios.delete(
        `https://franklin-unsprinkled-corrie.ngrok-free.dev/api/status/${companyName}/${statusId}`,
        { headers: { "ngrok-skip-browser-warning": "true" } }
      );

      if (res.data.success) {
        alert("Status deleted successfully");
        setStatuses(prev => prev.filter(s => s.id !== statusId));
        if (newAgenda.status_id === statusId) setNewAgenda({ ...newAgenda, status_id: "" });
      } else {
        alert(res.data.message || "Cannot delete status. It is used in the diary.");
      }
    } catch (err) { console.error(err); alert("Error deleting status"); }
  };

  const removeEvent = async (id) => {
    if (!confirm("Remove this event?")) return;
    try {
      await axios.delete(
        `https://franklin-unsprinkled-corrie.ngrok-free.dev/api/calendar/${companyName}/${id}`,
        { headers: { "ngrok-skip-browser-warning": "true" } }
      );
      setEvents(ev => ev.filter(e => e.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting event");
    }
  };

  const agendaForSelected = events.filter(e => e.date === selectedDate);

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Calendar</h1>
          <p className="text-sm text-slate-600">Keep track of agendas and orders.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="lg:col-span-2">
          <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">{monthLabel}</div>
              <div className="space-x-1">
                <button onClick={() => goMonth(-1)} className="text-xs px-2 py-1 rounded hover:bg-slate-100">Prev</button>
                <button onClick={() => goMonth(1)} className="text-xs px-2 py-1 rounded hover:bg-slate-100">Next</button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-xs text-slate-500 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} className="text-center font-medium">{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1 text-sm">
              {monthGrid.map(d => {
                const iso = formatISO(d);
                const inMonth = d.getMonth() === current.getMonth();
                const dayEvents = events.filter(e => e.date === iso);
                const isSelected = selectedDate === iso;
                return (
                  <div key={iso} onClick={() => setSelectedDate(iso)} className={`p-2 rounded-lg cursor-pointer min-h-[64px] border ${isSelected ? "border-indigo-300 bg-indigo-50" : "border-transparent"} ${inMonth ? "" : "text-slate-400 opacity-60"}`}>
                    <div className="flex items-start justify-between">
                      <div className="text-xs font-medium">{d.getDate()}</div>
                      <button onClick={e => { e.stopPropagation(); handleOpenAgendaModal(iso); }} className="text-[10px] px-1 py-0.5 rounded bg-slate-100 hover:bg-slate-200">+</button>
                    </div>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 2).map(e => <div key={e.id} className="text-[10px] bg-indigo-100 rounded px-1 py-0.5 truncate">{e.title}{e.time ? ` • ${e.time}` : ""}</div>)}
                      {dayEvents.length > 2 && <div className="text-[10px] text-slate-500">+{dayEvents.length - 2} more</div>}
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
            <button onClick={() => setSelectedDate(formatISO(new Date()))} className="text-xs px-2 py-1 rounded hover:bg-slate-100">Today</button>
          </div>

          {agendaForSelected.length === 0 ? (
            <div className="text-sm text-slate-500">No events. Click a date to add one.</div>
          ) : (
            <ul className="space-y-2">
              {agendaForSelected.map(e => (
                <li key={e.id} className="p-2 border rounded flex justify-between items-start">
                  <div>
                    <div className="text-sm font-medium">{e.title}</div>
                    <div className="text-xs text-slate-500">{e.time || "00:00"}</div>
                  </div>
                  <button onClick={() => removeEvent(e.id)} className="text-red-500 text-xs">Remove</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* --- New Agenda Modal --- */}
      {showAgendaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-5 rounded-xl shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-3">New Agenda</h2>

            <label className="block text-sm mb-1">Title</label>
            <input type="text" value={newAgenda.title} onChange={(e) => setNewAgenda({ ...newAgenda, title: e.target.value })} className="w-full border rounded px-2 py-1 mb-2 text-sm" placeholder="Enter title" />

            <label className="block text-sm mb-1">Time (HH:MM)</label>
            <div className="flex items-center gap-1 mb-2">
              <input type="text" maxLength="2" value={newAgenda.time.split(":")[0]} onChange={(e) => setNewAgenda({ ...newAgenda, time: `${e.target.value || "00"}:${newAgenda.time.split(":")[1]}` })} className="w-10 border rounded px-1 py-1 text-center text-sm" />
              <span>:</span>
              <input type="text" maxLength="2" value={newAgenda.time.split(":")[1]} onChange={(e) => setNewAgenda({ ...newAgenda, time: `${newAgenda.time.split(":")[0]}:${e.target.value || "00"}` })} className="w-10 border rounded px-1 py-1 text-center text-sm" />
            </div>

            {/* Status Dropdown */}
            <div className="mb-4">
              <label className="block text-sm mb-1">Status</label>
              <div className="relative">
                <button type="button" onClick={() => setShowStatusDropdown((prev) => !prev)} className="w-full border rounded px-2 py-1 text-sm flex justify-between items-center">
                  {newAgenda.status_id ? statuses.find((s) => s.id === newAgenda.status_id)?.status_desc : "Select status"}
                  <span className="ml-2">▾</span>
                </button>

                {showStatusDropdown && (
                  <div className="absolute w-full mt-1 bg-white border rounded shadow max-h-48 overflow-y-auto z-20">
                    {statuses.map((s) => (
                      <div key={s.id} className="flex justify-between items-center px-2 py-1 hover:bg-slate-100 text-sm cursor-pointer">
                        <span onClick={() => { setNewAgenda({ ...newAgenda, status_id: s.id }); setShowStatusDropdown(false); }}>{s.status_desc}</span>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteStatus(s.id, s.status_desc); }} className="text-red-500 text-xs ml-2">×</button>
                      </div>
                    ))}

                    <div onClick={() => { setShowStatusModal(true); setShowStatusDropdown(false); }} className="px-2 py-1 text-sm text-indigo-500 hover:bg-indigo-50 cursor-pointer flex items-center gap-1">
                      <Plus size={14} /> Add new status
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAgendaModal(false)} className="px-3 py-1 text-sm rounded bg-slate-100">Cancel</button>
              <button onClick={handleSaveAgenda} className="px-3 py-1 text-sm rounded bg-indigo-500 text-white">Save</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* --- New Status Modal --- */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-5 rounded-xl shadow-lg w-72">
            <h2 className="text-lg font-semibold mb-3">New Status</h2>
            <input type="text" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} placeholder="Enter status name" className="w-full border rounded px-2 py-1 mb-3 text-sm" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowStatusModal(false)} className="px-3 py-1 text-sm rounded bg-slate-100">Cancel</button>
              <button onClick={handleSaveStatus} className="px-3 py-1 text-sm rounded bg-indigo-500 text-white">Save</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
