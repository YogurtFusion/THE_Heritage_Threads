"use client";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function ContactsClient() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");

  const fetchContacts = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/contacts")
      .then((r) => r.json())
      .then((d) => { if (d.success) setContacts(d.data); else toast.error(d.message); })
      .catch(() => toast.error("Failed to load contacts"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this message?")) return;
    try {
      const res = await fetch(`/api/admin/contacts?id=${id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) { toast.success("Deleted"); setContacts((p) => p.filter((c) => c._id !== id)); }
      else toast.error(d.message);
    } catch { toast.error("Delete failed"); }
  };

  const filtered = contacts.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.message?.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-primary mb-1">Contact Messages</h1>
        <p className="text-muted-text text-sm">{contacts.length} message{contacts.length !== 1 ? "s" : ""} received</p>
      </div>

      <div className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Search messages…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-border rounded-md bg-body text-sm text-body-text placeholder:text-muted-text focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-card border border-border rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-text">{search ? "No messages match your search" : "No contact messages yet"}</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => (
            <div key={c._id} className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="flex items-start justify-between p-5 cursor-pointer" onClick={() => setExpanded(expanded === c._id ? null : c._id)}>
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">
                    {c.name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-heading text-sm">{c.name}</p>
                      <a href={`mailto:${c.email}`} className="text-xs text-primary hover:underline" onClick={(e) => e.stopPropagation()}>{c.email}</a>
                    </div>
                    <p className="text-sm text-body-text mt-1 truncate">{c.message}</p>
                    <p className="text-xs text-muted-text mt-1">{formatDate(c.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <a href={`mailto:${c.email}?subject=Re: Your message`} onClick={(e) => e.stopPropagation()}
                    className="text-xs text-primary hover:text-primary-hover font-medium transition-colors px-3 py-1.5 border border-primary rounded-md hover:bg-primary hover:text-white">
                    Reply
                  </a>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(c._id); }}
                    className="text-xs text-error hover:opacity-70 font-medium transition-opacity px-3 py-1.5 border border-error rounded-md hover:bg-red-50">
                    Delete
                  </button>
                  <svg className={`w-4 h-4 text-muted-text transition-transform ${expanded === c._id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {expanded === c._id && (
                <div className="px-5 pb-5 border-t border-border pt-4">
                  <p className="text-sm text-body-text whitespace-pre-wrap leading-relaxed">{c.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
