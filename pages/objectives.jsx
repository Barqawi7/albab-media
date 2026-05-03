import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "../lib/supabase";

const SEED_TASKS = [
  "Call Maya Clinic",
  "Register in Model's Group",
  "Fix everything to do with Manoj (Be Fair)",
  "Manoj Leaves",
  "Clients Registrations (All of Them)",
  "DLBS Reviews Respond",
  "Go Through Overall Objectives",
  "Update all the Excel Sheets",
  "Manoj — Content Review All",
  "Manoj — Nestle Old Links to be Shared",
  "Palestinian Survey",
  "Ayad — New Data",
  "Berta Plan & Meeting",
  "LinkedIn Stuff — Decision & Plan",
  "Mezura Invoice",
  "Mezura Form",
  "Diamond Center — Email & Meeting",
  "All Emails & Notifications",
  "Antonella Meeting",
  "Lana Talk",
  "Manoj — Mezura HD Shortlist",
  "Manoj — Nestle New Project",
  "Shatha Meeting",
  "Tria — Document Update & Share",
  "Rivage (Priority)",
  "ROF Quotation & Plan",
  "NP — Batool Meeting",
  "ABM Heepsy Influencer Application",
  "Mayada Meeting (suggested next Friday)",
  "Influencers & Models — Contacts, Next Step & Meeting",
  "Kamira Plan",
  "Mese — Pilates Teacher",
  "Lamborghini",
  "Najjar — Emaar",
  "Alami — Emails",
  "Mezura Plan & Branding",
  "Hakeem Meeting",
  "Mezura Concept",
  "New Prospects Emails (Important)",
  "HR Process",
  "Hiba Meeting",
  "Ahmad Abu Sharkh Meeting",
  "Ali Rahmou Meeting",
  "Ayad Objectives",
  "Car Renewal",
  "Saudi Caller Thingy",
  "Fashion Plan",
  "Mezura Shoot 2 — to decide",
  "NP — Ultra",
  "Maisa Meeting",
  "Car Registration Renewal",
  "Meet with Carl",
  "Meet with Ali Al Rais",
  "ROF SM (Final Stage)",
  "Meeting ROF (Be Prepared)",
  "Email for Rivage",
  "ION New Branding & Launch",
  "Manoj Rules & KPIs",
  "Tyla Email Everday (AI Integration)",
  "DLBS | Dettol Content",
  "Reach EMIC (2ND Half of the Year)",
  "TRIA (Updated Quotation)",
  "TRIA Branding Meeting",
  "TRIA | New Instructor Support",
  "KAMIRA | New Quotation",
  "Yara | Plan",
  "Mais Meeting for TRIA & KAMIRA",
  "Mezura Quotation | Revised",
  "Meeting with Jad",
  "MEZURA Plan | Studio, Model, & Creative Aspect",
  "ABM | Influencer Application",
  "Alami | Old & New Sales",
  "Antonella Email & Next Step",
  "WhatsApp | Follow Ups",
  "Manoj Review All & Next Step",
  "DED Pricing",
  "Fix old HD",
  "Establishment Card Renewal",
  "Manoj Payments",
  "Instagram & LinkedIn | Sales",
  "Reach Amit",
  "Sales List | Daily Sales",
  "Car Target | Sales",
  "Real Estate Target| Sales",
  "Agents Target| Sales",
  "Influencers Target | Sales",
  "Agencies Target | Sales",
  "Models Target | Sales",
  "Apparel | Sales",
  "Nissan Me | Sales",
  "NP | Ultra & Influencers",
  "Trading Plan & AI",
  "Fix All HDs",
  "Fix & Organize Office",
  "Lynk & Co | Next Step",
  "BAB Operational Platform (AI)",
  "Ayad Show & Yango Play",
  "ITA Registration Work",
  "Yara | HM (Meeting)",
  "ADCB FIX",
  "Wage Protection | Check",
  "Nestle New Project 1",
  "Nestle New Project 2",
  "Nestle Registration",
  "Meeting with Farah",
  "New Business Card",
  "HR | PA - Sales (2) - Intern (2)",
  "Fis SM Algorithm",
  "MOF Registration",
  "Purple Oryx Registration",
  "BAB | SM Visuals",
  "BAB | SI (A to Z)",
  "Marwaa Discussion",
  "Manoj Workshop",
  "Ounass | Sales",
  "EMAAR & MAF | Sales",
  "Manoj | SC",
  "Grendel | Sales",
  "DLBS | Parking Link & Google Review",
  "AL Reef | Sales",
  "Al Zeer | Sales (Tailor Idea)",
  "ABM | BAB Gallery",
  "Preville",
  "Guitar",
  "Ajman TV",
  "P & G | Sales",
  "Social Media | Update All",
  "Amazon Card",
  "ABM | SM Plan",
  "Mom | Ali Express",
  "DLBS | Dashboard",
  "WhatsApp | ABM & DLBS",
  "Mezura | Next Project",
  "DLBS | SM",
  "Taqyeem",
  "Nadine & HAVAS | Next Step",
  "Taj & Hayattt",
  "ABM | FTA",
  "The Community",
  "Investor Options",
  "Sami | Saudi",
  "Bader | Saudi",
  "Nehme Meeting",
  "HBMM | Plan & FU",
  "Arabian Oud",
  "MAG",
  "All my Circle Connections | Connect it",
  "Nestle | All Team",
  "Dubai Tourism | Idea",
  "SKIMs Project | Nazih",
  "Sales Cycle | AI",
  "Client 360 Analysis | AI",
  "Costing Calculator | AI",
  "Strategy & Proposal | AI",
  "Jordan Sketches",
  "Personal Education | AI & BD",
  "META & Google Ads | Education",
  "Newsletter Plan",
  "Real Estate | Influencer Group",
  "PO BOX | Check",
  "ABM | Operational System, Plan, Contracts ..etc.",
  "DLBS | Selling App",
  "DLBS | One Hour Video",
  "BAB Mom Salary",
  "Lana's Gift",
  "BAB | Take Care of All Payments",
  "BAB | Body & Beard Laser",
  "BAB | Glasses (Leen)",
  "BAB | Hair Check",
  "BAB | Eye Laser",
  "BAB | Family Gifts",
  "BAB | Car Payments",
  "BAB | Pay Back (All x 5)",
  "Events & Connections",
  "Jetour & BYD & AUDI | Sales",
  "Meeting with Maya",
  "Hiba Al Ahmadi",
  "ABM | Meta Ads (Sales)",
  "Sephora | Sales",
  "Imagination Ad | Sales",
  "SAI Luxury | Sales",
  "Palestinian Community",
  "Summer the Slayer",
  "MEZ | Sales",
  "Cecilia | Sales",
  "Dr. Mohamed | Sales",
  "Tarek Fitvision | Sales",
  "Rami Abu Shakra | Option",
  "Ravi Javeri  | Sales",
  "Mariam Qasim | Sales",
  "Xaya | Sales",
  "Fara | Huawei | Sales",
  "Hassan Baji | Sales",
  "The Chef | Sales",
  "Hadeel Influencer",
  "Government Target | Sales",
  "Haydar | IT (Support)",
  "Ayad | Talal Abu Ghazali",
  "Ayad | NBF",
  "Ayad | Falcon",
  "Ayad | New Data",
  "Ayad | ADIB",
  "Ayad | Insurance Company",
  "Ayad | Dad & Manager",
  "BAB Outfits Selling",
  "Find a poor talent",
  "Drag-and-drop tasks between categories and buckets (albab-objectives)",
  "Done / mark-complete option that archives the task with undo (albab-objectives)",
  "Supabase RLS security fix for Business OS + albab-objectives",
  "Push albab-objectives to GitHub and deploy to Vercel",
  "Voice input mic button — tap to speak, AI parses priority/time/category and auto-adds task",
  "Google Calendar two-way sync for meetings (albab-objectives)",
  "Gmail API full integration for Business OS — automated outreach and send capability",
  "Mobile app version of the Business OS (after web is stable)",
  "Influencer pricing and rate benchmarking ongoing for client work",
  "Make every number in Business OS clickable to reveal entity behind it",
  "Build new online Arabic-capable dashboard (briefing TBD)",
];

const BUCKETS = ["thisWeek", "nextWeek", "nextMonth", "nextQuarter"];
const BUCKET_LABEL = { thisWeek: "THIS WEEK", nextWeek: "NEXT WEEK", nextMonth: "NEXT MONTH", nextQuarter: "NEXT QUARTER" };
const BUCKET_SHORT = { thisWeek: "WEEK", nextWeek: "NEXT WK", nextMonth: "NEXT MO", nextQuarter: "NEXT Q" };
const BUCKET_COLOR = { thisWeek: "#4ade80", nextWeek: "#60a5fa", nextMonth: "#f59e0b", nextQuarter: "#a78bfa" };
const DAYS = ["FRI", "SAT", "SUN", "MON", "TUE", "WED", "THU"];
const TABS = ["ALL", ...BUCKETS, ...DAYS];

function pad3(n) {
  return String(n).padStart(3, "0");
}

function tagChip(label, color) {
  return (
    <span
      style={{
        padding: "3px 9px",
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.5,
        background: color + "1a",
        border: "1px solid " + color + "55",
        color: color,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

export default function Objectives() {
  const [tasks, setTasks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("ALL");
  const [filter, setFilter] = useState("");
  const [addText, setAddText] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [hideBucketed, setHideBucketed] = useState(false);
  const [dayModalFor, setDayModalFor] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const undoTimerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("objectives_hide_bucketed");
    if (stored === "1") setHideBucketed(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("objectives_v2")
        .select("*")
        .order("position", { ascending: false })
        .order("created", { ascending: false });
      if (cancelled) return;
      if (error) {
        console.error("[objectives] fetch", error);
        setLoaded(true);
        return;
      }
      if (!data || data.length === 0) {
        const now = Date.now();
        const seed = SEED_TASKS.map((text, i) => ({
          id: crypto.randomUUID(),
          text,
          bucket: null,
          day: null,
          created: now + i,
          position: SEED_TASKS.length - i,
        }));
        const CHUNK = 100;
        for (let i = 0; i < seed.length; i += CHUNK) {
          const chunk = seed.slice(i, i + CHUNK);
          const { error: insErr } = await supabase.from("objectives_v2").insert(chunk);
          if (insErr) console.error("[objectives] seed", insErr);
        }
        if (!cancelled) setTasks(seed.slice().sort((a, b) => b.position - a.position || b.created - a.created));
      } else {
        setTasks(data);
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleHideBucketed = () => {
    setHideBucketed(prev => {
      const next = !prev;
      if (typeof window !== "undefined") window.localStorage.setItem("objectives_hide_bucketed", next ? "1" : "0");
      return next;
    });
  };

  const updateLocal = (id, patch) => {
    setTasks(ts => ts.map(t => (t.id === id ? { ...t, ...patch } : t)));
  };

  const updateRemote = async (id, patch) => {
    const { error } = await supabase.from("objectives_v2").update(patch).eq("id", id);
    if (error) console.error("[objectives] update", error);
  };

  const setBucket = (id, bucket) => {
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    const newBucket = t.bucket === bucket ? null : bucket;
    const patch = { bucket: newBucket };
    if (newBucket !== "thisWeek") patch.day = null;
    updateLocal(id, patch);
    updateRemote(id, patch);
  };

  const setDay = (id, day) => {
    const patch = { day };
    if (day) patch.bucket = "thisWeek";
    updateLocal(id, patch);
    updateRemote(id, patch);
  };

  const editText = (id) => {
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    const next = window.prompt("Edit task", t.text);
    if (next === null) return;
    const trimmed = next.trim();
    if (!trimmed || trimmed === t.text) return;
    updateLocal(id, { text: trimmed });
    updateRemote(id, { text: trimmed });
  };

  const deleteWithUndo = (id) => {
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    if (pendingDelete && undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      supabase.from("objectives_v2").delete().eq("id", pendingDelete.task.id).then(({ error }) => {
        if (error) console.error("[objectives] flush prior delete", error);
      });
    }
    setTasks(ts => ts.filter(x => x.id !== id));
    setSelectedIds(prev => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    const timeoutId = setTimeout(async () => {
      const { error } = await supabase.from("objectives_v2").delete().eq("id", id);
      if (error) console.error("[objectives] delete", error);
      setPendingDelete(null);
      undoTimerRef.current = null;
    }, 4000);
    undoTimerRef.current = timeoutId;
    setPendingDelete({ task: t, timeoutId });
  };

  const undoDelete = () => {
    if (!pendingDelete) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = null;
    setTasks(ts => [...ts, pendingDelete.task].sort((a, b) => b.position - a.position || b.created - a.created));
    setPendingDelete(null);
  };

  const addTask = async () => {
    const text = addText.trim();
    if (!text) return;
    const maxPos = tasks.reduce((m, t) => Math.max(m, t.position || 0), 0);
    const row = {
      id: crypto.randomUUID(),
      text,
      bucket: null,
      day: null,
      created: Date.now(),
      position: maxPos + 1,
    };
    setTasks(ts => [row, ...ts]);
    setAddText("");
    const { error } = await supabase.from("objectives_v2").insert(row);
    if (error) console.error("[objectives] insert", error);
  };

  const resetAll = async () => {
    if (!window.confirm("Clear all bucket and day assignments on every task?")) return;
    setTasks(ts => ts.map(t => ({ ...t, bucket: null, day: null })));
    const { error } = await supabase.from("objectives_v2").update({ bucket: null, day: null }).not("id", "is", null);
    if (error) console.error("[objectives] reset", error);
  };

  const toggleSelected = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkSetBucket = async (bucket) => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    const patch = { bucket };
    if (bucket !== "thisWeek") patch.day = null;
    setTasks(ts => ts.map(t => (selectedIds.has(t.id) ? { ...t, ...patch } : t)));
    const { error } = await supabase.from("objectives_v2").update(patch).in("id", ids);
    if (error) console.error("[objectives] bulk bucket", error);
  };

  const bulkSetDay = async (day) => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    const patch = { day };
    if (day) patch.bucket = "thisWeek";
    setTasks(ts => ts.map(t => (selectedIds.has(t.id) ? { ...t, ...patch } : t)));
    const { error } = await supabase.from("objectives_v2").update(patch).in("id", ids);
    if (error) console.error("[objectives] bulk day", error);
  };

  const bulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    setTasks(ts => ts.filter(t => !selectedIds.has(t.id)));
    setSelectedIds(new Set());
    const { error } = await supabase.from("objectives_v2").delete().in("id", ids);
    if (error) console.error("[objectives] bulk delete", error);
  };

  const counts = useMemo(() => {
    const c = { ALL: tasks.length };
    for (const b of BUCKETS) c[b] = 0;
    for (const d of DAYS) c[d] = 0;
    for (const t of tasks) {
      if (t.bucket && c[t.bucket] !== undefined) c[t.bucket] += 1;
      if (t.bucket === "thisWeek" && t.day && c[t.day] !== undefined) c[t.day] += 1;
    }
    return c;
  }, [tasks]);

  const visible = useMemo(() => {
    let list = tasks;
    if (tab === "ALL") {
      if (hideBucketed) list = list.filter(t => !t.bucket);
    } else if (BUCKETS.includes(tab)) {
      list = list.filter(t => t.bucket === tab);
    } else if (DAYS.includes(tab)) {
      list = list.filter(t => t.bucket === "thisWeek" && t.day === tab);
    }
    const q = filter.trim().toLowerCase();
    if (q) list = list.filter(t => t.text.toLowerCase().includes(q));
    return list;
  }, [tasks, tab, filter, hideBucketed]);

  const todayLabel = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString("en-AE", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).toUpperCase();
  }, []);

  const renderCard = (t, idx) => {
    const isSelected = selectedIds.has(t.id);
    const accent = t.bucket ? BUCKET_COLOR[t.bucket] : "#1f1f1f";
    const onCardClick = () => {
      if (selectMode) toggleSelected(t.id);
    };
    return (
      <div
        key={t.id}
        onClick={onCardClick}
        className="obj-card"
        style={{
          background: isSelected ? "#1a1f17" : "#111",
          border: "1px solid " + (isSelected ? "#4ade80" : "#1f1f1f"),
          borderLeft: "3px solid " + accent,
          borderRadius: 8,
          padding: "12px 14px",
          cursor: selectMode ? "pointer" : "default",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          transition: "background .12s, border-color .12s",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "baseline", minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: 10, color: "#555", fontWeight: 600, letterSpacing: 1, flexShrink: 0 }}>
              #{pad3(idx + 1)}
            </span>
            <span style={{ fontSize: 14, color: "#e5e5e5", lineHeight: 1.4, wordBreak: "break-word" }}>{t.text}</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {t.bucket && tagChip(BUCKET_LABEL[t.bucket], BUCKET_COLOR[t.bucket])}
            {t.bucket === "thisWeek" && t.day && tagChip(t.day, "#e5e5e5")}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }} onClick={e => e.stopPropagation()}>
          <button className="obj-btn obj-btn-primary" onClick={() => deleteWithUndo(t.id)}>
            DONE
          </button>
          {BUCKETS.map(b => {
            const active = t.bucket === b;
            const c = BUCKET_COLOR[b];
            return (
              <button
                key={b}
                onClick={() => setBucket(t.id, b)}
                className="obj-btn"
                style={
                  active
                    ? { background: c + "1a", borderColor: c + "66", color: c }
                    : undefined
                }
              >
                {BUCKET_SHORT[b]}
              </button>
            );
          })}
          <button className="obj-btn" onClick={() => setDayModalFor(t.id)}>
            DAY
          </button>
          <button className="obj-btn" onClick={() => editText(t.id)}>
            EDIT
          </button>
        </div>
      </div>
    );
  };

  const renderGrid = (list, startIdx = 0) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
        gap: 10,
      }}
    >
      {list.map((t, i) => renderCard(t, startIdx + i))}
    </div>
  );

  let body = null;
  if (!loaded) {
    body = <div style={{ color: "#555", fontSize: 13, padding: "40px 0", textAlign: "center" }}>Loading…</div>;
  } else if (tab === "thisWeek") {
    const groups = { UNASSIGNED: [], FRI: [], SAT: [], SUN: [], MON: [], TUE: [], WED: [], THU: [] };
    for (const t of visible) groups[t.day || "UNASSIGNED"].push(t);
    const order = ["UNASSIGNED", ...DAYS];
    let idx = 0;
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {order.map(d => {
          const list = groups[d];
          if (!list.length) return null;
          const startIdx = idx;
          idx += list.length;
          return (
            <section key={d}>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: 2,
                  fontWeight: 700,
                  color: "#999",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>{d}</span>
                <span
                  style={{
                    fontSize: 10,
                    color: "#666",
                    background: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: 6,
                    padding: "2px 7px",
                    letterSpacing: 0,
                  }}
                >
                  {list.length}
                </span>
              </div>
              {renderGrid(list, startIdx)}
            </section>
          );
        })}
        {visible.length === 0 && (
          <div style={{ color: "#555", fontSize: 13, padding: "40px 0", textAlign: "center" }}>No tasks in This Week.</div>
        )}
      </div>
    );
  } else {
    body = visible.length ? (
      renderGrid(visible)
    ) : (
      <div style={{ color: "#555", fontSize: 13, padding: "40px 0", textAlign: "center" }}>No tasks.</div>
    );
  }

  return (
    <div className="obj-root" style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e5e5e5" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "26px 22px 80px" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 22,
          }}
        >
          <a
            href="/"
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 2,
              color: "#fff",
              textDecoration: "none",
            }}
          >
            BADER AL BARQAWI · OBJECTIVES
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "#666", letterSpacing: 1 }}>{todayLabel}</span>
            <span className="obj-pill">ALL {counts.ALL}</span>
            <span className="obj-pill">THIS WEEK {counts.thisWeek}</span>
          </div>
        </header>

        <nav
          style={{
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
            marginBottom: 18,
            borderBottom: "1px solid #1f1f1f",
          }}
        >
          {TABS.map(k => {
            const isActive = tab === k;
            const label = k === "ALL" ? "ALL" : BUCKETS.includes(k) ? BUCKET_LABEL[k] : k;
            return (
              <button
                key={k}
                onClick={() => setTab(k)}
                className="obj-tab"
                style={{
                  color: isActive ? "#fff" : "#777",
                  borderBottom: "2px solid " + (isActive ? "#fff" : "transparent"),
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {label}
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: 10,
                    color: isActive ? "#fff" : "#555",
                    background: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: 6,
                    padding: "1px 6px",
                  }}
                >
                  {counts[k] ?? 0}
                </span>
              </button>
            );
          })}
        </nav>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <input
            value={addText}
            onChange={e => setAddText(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") addTask();
            }}
            placeholder="Add a task and press Enter"
            className="obj-input"
            style={{ flex: "1 1 280px", minWidth: 220 }}
          />
          <button className="obj-btn obj-btn-primary" onClick={addTask}>
            ADD
          </button>
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter…"
            className="obj-input"
            style={{ flex: "0 1 220px", minWidth: 160 }}
          />
          <button
            className="obj-btn"
            onClick={() => {
              setSelectMode(s => !s);
              if (selectMode) clearSelection();
            }}
            style={selectMode ? { background: "#1a1a1a", color: "#fff", borderColor: "#3a3a3a" } : undefined}
          >
            {selectMode ? "✓ SELECTING" : "SELECT MULTIPLE"}
          </button>
          <button
            className="obj-btn"
            onClick={toggleHideBucketed}
            style={hideBucketed ? { background: "#1a1a1a", color: "#fff", borderColor: "#3a3a3a" } : undefined}
            title="When on, the ALL tab hides any task that already has a bucket"
          >
            👁 {hideBucketed ? "HIDING BUCKETED" : "HIDE BUCKETED FROM ALL"}
          </button>
          <button className="obj-btn" onClick={resetAll}>
            RESET
          </button>
        </div>

        {selectMode && selectedIds.size > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 8,
              padding: "10px 12px",
              background: "#111",
              border: "1px solid #2a2a2a",
              borderRadius: 8,
              marginBottom: 14,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#fff" }}>
              {selectedIds.size} SELECTED
            </span>
            <select
              className="obj-select"
              defaultValue=""
              onChange={e => {
                const v = e.target.value;
                if (!v) return;
                bulkSetBucket(v === "none" ? null : v);
                e.target.value = "";
              }}
            >
              <option value="" disabled>
                BUCKET…
              </option>
              <option value="thisWeek">This Week</option>
              <option value="nextWeek">Next Week</option>
              <option value="nextMonth">Next Month</option>
              <option value="nextQuarter">Next Quarter</option>
              <option value="none">None</option>
            </select>
            <select
              className="obj-select"
              defaultValue=""
              onChange={e => {
                const v = e.target.value;
                if (!v) return;
                bulkSetDay(v === "none" ? null : v);
                e.target.value = "";
              }}
            >
              <option value="" disabled>
                DAY…
              </option>
              {DAYS.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
              <option value="none">None</option>
            </select>
            <button className="obj-btn obj-btn-primary" onClick={bulkDelete}>
              DONE
            </button>
            <button className="obj-btn" onClick={clearSelection}>
              CLEAR
            </button>
          </div>
        )}

        {body}
      </div>

      {dayModalFor && (
        <div
          onClick={() => setDayModalFor(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 16,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#111",
              border: "1px solid #2a2a2a",
              borderRadius: 10,
              padding: 20,
              minWidth: 280,
              maxWidth: 380,
              width: "100%",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#999", marginBottom: 14 }}>
              ASSIGN DAY
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
              {DAYS.map(d => (
                <button
                  key={d}
                  className="obj-btn"
                  style={{ padding: "10px 12px", justifyContent: "center" }}
                  onClick={() => {
                    setDay(dayModalFor, d);
                    setDayModalFor(null);
                  }}
                >
                  {d}
                </button>
              ))}
              <button
                className="obj-btn"
                style={{ padding: "10px 12px", gridColumn: "1 / -1", justifyContent: "center" }}
                onClick={() => {
                  setDay(dayModalFor, null);
                  setDayModalFor(null);
                }}
              >
                REMOVE DAY
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#111",
            border: "1px solid #2a2a2a",
            borderRadius: 10,
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            zIndex: 60,
            boxShadow: "0 6px 30px rgba(0,0,0,.6)",
          }}
        >
          <span style={{ fontSize: 12, color: "#bbb" }}>
            Done: <span style={{ color: "#fff", fontWeight: 600 }}>{pendingDelete.task.text}</span>
          </span>
          <button className="obj-btn" onClick={undoDelete} style={{ borderColor: "#4ade80", color: "#4ade80" }}>
            UNDO
          </button>
        </div>
      )}

      <style>{`
        body, html { margin: 0; padding: 0; background: #0a0a0a; }
        .obj-root, .obj-root * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; box-sizing: border-box; }
        .obj-root ::-webkit-scrollbar { width: 6px; height: 6px; }
        .obj-root ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 4px; }
        .obj-pill {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          font-size: 11px;
          padding: 5px 10px;
          border-radius: 6px;
          color: #ccc;
          letter-spacing: 1px;
          font-weight: 600;
        }
        .obj-tab {
          background: transparent;
          border: none;
          padding: 10px 14px;
          font-size: 11px;
          letter-spacing: 1.5px;
          cursor: pointer;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
        }
        .obj-tab:hover { color: #ccc; }
        .obj-input {
          background: #111;
          border: 1px solid #2a2a2a;
          border-radius: 6px;
          padding: 8px 12px;
          color: #e5e5e5;
          font-size: 12px;
          outline: none;
          font-family: inherit;
        }
        .obj-input:focus { border-color: #3a3a3a; }
        .obj-input::placeholder { color: #555; }
        .obj-select {
          background: #111;
          border: 1px solid #2a2a2a;
          border-radius: 6px;
          padding: 7px 10px;
          color: #e5e5e5;
          font-size: 11px;
          letter-spacing: 1px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          outline: none;
        }
        .obj-btn {
          background: transparent;
          border: 1px solid #2a2a2a;
          border-radius: 6px;
          padding: 6px 10px;
          color: #bbb;
          font-size: 10px;
          letter-spacing: 1px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          transition: background .12s, border-color .12s, color .12s;
        }
        .obj-btn:hover { background: #141414; color: #fff; border-color: #3a3a3a; }
        .obj-btn-primary {
          background: #fff;
          color: #000;
          border-color: #fff;
        }
        .obj-btn-primary:hover { background: #e5e5e5; color: #000; border-color: #e5e5e5; }
        .obj-card:hover { background: #141414 !important; }
      `}</style>
    </div>
  );
}
