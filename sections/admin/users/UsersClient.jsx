"use client";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function UsersClient() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => { if (d.success) setUsers(d.data); else toast.error(d.message); })
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Role updated");
        setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role: newRole } : u));
      } else {
        toast.error(data.message ?? "Update failed");
      }
    } catch { toast.error("An error occurred"); }
    finally { setUpdating(null); }
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.includes(q);
  });

  const initials = (name) => name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-primary mb-1">Users</h1>
        <p className="text-muted-text text-sm">{users.length} registered account{users.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Search by name or email…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-border rounded-md bg-body text-sm text-body-text placeholder:text-muted-text focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-card border border-border rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-text">
          {search ? "No users match your search" : "No users yet"}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white border border-border rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-card border-b border-border">
                  {["User", "Email", "Role", "Joined", "Change Role"].map((h) => (
                    <th key={h} className="py-4 px-6 text-xs font-semibold text-muted-text uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((user) => (
                  <tr key={user._id} className="hover:bg-card transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-border" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {initials(user.name)}
                          </div>
                        )}
                        <span className="text-sm font-medium text-heading">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-body-text">{user.email}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${user.role === "admin" ? "bg-primary/10 text-primary" : "bg-border text-body-text"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-body-text">{formatDate(user.createdAt)}</td>
                    <td className="py-4 px-6">
                      <select value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        disabled={updating === user._id}
                        className="text-xs border border-border rounded-md px-2 py-1.5 bg-body text-body-text focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 cursor-pointer">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filtered.map((user) => (
              <div key={user._id} className="bg-card border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-border" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {initials(user.name)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-heading">{user.name}</p>
                    <p className="text-xs text-muted-text">{user.email}</p>
                  </div>
                  <span className={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${user.role === "admin" ? "bg-primary/10 text-primary" : "bg-border text-body-text"}`}>
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-text">Joined {formatDate(user.createdAt)}</span>
                  <select value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    disabled={updating === user._id}
                    className="text-xs border border-border rounded-md px-2 py-1.5 bg-body text-body-text focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
