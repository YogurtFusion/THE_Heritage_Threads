"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export const UserCard = () => {
  const { data: session, update } = useSession();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user?.name) {
      const parts = session.user.name.split(" ");
      setFirstName(parts[0] ?? "");
      setLastName(parts.slice(1).join(" ") ?? "");
    }
  }, [session?.user?.name]);

  const handleSave = async () => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName) { toast.error("Name cannot be empty"); return; }
    setSaving(true);
    try {
      // Update via API
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName }),
      });
      const data = await res.json();
      if (data.success) {
        await update({ name: fullName }); // refresh session
        toast.success("Profile updated");
        setEditing(false);
      } else {
        toast.error(data.message ?? "Failed to update");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (session?.user?.name) {
      const parts = session.user.name.split(" ");
      setFirstName(parts[0] ?? "");
      setLastName(parts.slice(1).join(" ") ?? "");
    }
    setEditing(false);
  };

  if (!session?.user) return null;

  const iCls = (editable) =>
    `w-full bg-body border p-3 text-heading focus:outline-none transition-colors ${
      editable
        ? "border-primary focus:ring-1 focus:ring-primary"
        : "border-border opacity-70 cursor-not-allowed"
    }`;

  return (
    <article className="bg-card border border-border p-8 md:p-10 mb-8">
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-playfair text-2xl text-heading">Details</h3>
        {!editing ? (
          <button aria-label="Edit Details" onClick={() => setEditing(true)}
            className="text-muted-text hover:text-primary transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        ) : (
          <span className="text-xs text-primary font-medium">Editing…</span>
        )}
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold tracking-widest text-heading mb-2 uppercase">First Name</label>
            <input type="text" value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              readOnly={!editing}
              className={iCls(editing)}
              placeholder="First name"
            />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest text-heading mb-2 uppercase">Last Name</label>
            <input type="text" value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              readOnly={!editing}
              className={iCls(editing)}
              placeholder="Last name"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold tracking-widest text-heading mb-2 uppercase">Email Address</label>
          <input type="email" value={session.user.email ?? ""} readOnly
            className={iCls(false)} />
          <p className="text-xs text-muted-text mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-xs font-bold tracking-widest text-heading mb-2 uppercase">Account Type</label>
          <input type="text" value={session.user.role ?? "user"} readOnly
            className={`${iCls(false)} capitalize`} />
        </div>

        {editing && (
          <div className="flex gap-3">
            <button type="button" onClick={handleSave} disabled={saving}
              className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold tracking-widest text-sm uppercase py-4 transition-colors disabled:opacity-60">
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button type="button" onClick={handleCancel}
              className="px-6 border border-border text-body-text hover:bg-body transition-colors text-sm font-medium">
              Cancel
            </button>
          </div>
        )}
      </div>
    </article>
  );
};
