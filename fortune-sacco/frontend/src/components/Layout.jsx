import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notificationsAPI } from "../services/api";
import { useToast } from "../context/ToastContext";
import Icon from "./Icon";

const BRANCHES_MAP = { NBI:"Nairobi HQ", MSA:"Mombasa", KSM:"Kisumu", NKR:"Nakuru", ELD:"Eldoret", THK:"Thika", NYR:"Nyeri", MRU:"Meru", KTL:"Kitale", KRC:"Kericho", EMB:"Embu", MCK:"Machakos", KKM:"Kakamega", GRS:"Garissa", MLD:"Malindi", NNK:"Nanyuki", BGM:"Bungoma", KSI:"Kisii", NVS:"Naivasha", MRG:"Muranga" };

const NAV = [
  { path: "/",           label: "Dashboard",    icon: "home",     roles: ["all"] },
  { path: "/policies",   label: "Policies",     icon: "fileText", roles: ["all"] },
  { path: "/claims",     label: "Claims",       icon: "activity", roles: ["all"] },
  { path: "/premiums",   label: "Premiums",     icon: "dollar",   roles: ["System Admin","HR/CEO","Claims Officer"] },
  { path: "/members",    label: "Members",      icon: "users",    roles: ["all"] },
  { path: "/hospitals",  label: "Hospitals",    icon: "hospital", roles: ["all"] },
  { path: "/branches",   label: "Branches",     icon: "building", roles: ["System Admin","HR/CEO"] },
  { path: "/audit",      label: "Audit Logs",   icon: "lock",     roles: ["System Admin","HR/CEO"] },
  { path: "/users",      label: "User Mgmt",    icon: "user",     roles: ["System Admin"] },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [notifs, setNotifs]     = useState([]);
  const [unread, setUnread]     = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [pendingClaims, setPendingClaims] = useState(0);
  const notifRef = useRef(null);

  const visibleNav = NAV.filter(n => n.roles.includes("all") || n.roles.includes(user?.role));

  const loadNotifs = async () => {
    try {
      const r = await notificationsAPI.getAll();
      setNotifs(r.data.data || []);
      setUnread(r.data.unread || 0);
    } catch {}
  };

  useEffect(() => {
    loadNotifs();
    const interval = setInterval(loadNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = e => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.info("Signed out", "You have been logged out successfully.");
    navigate("/login");
  };

  const handleMarkAllRead = async () => {
    await notificationsAPI.markAllRead();
    loadNotifs();
  };

  const branchName = user?.branchName || BRANCHES_MAP[user?.branch] || user?.branch;
  const typeColor = { success: "#10b981", error: "#ef4444", warning: "#f59e0b", info: "#3b82f6" };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* ── Sidebar ── */}
      <aside style={{ width: 250, background: "linear-gradient(160deg,#0a2540 0%,#0a3d62 50%,#0d4f7c 100%)", color: "white", display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto" }}>
        <div style={{ padding: "20px 16px 12px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ width: 40, height: 40, background: "#f59e0b", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 18, color: "#0a2540", flexShrink: 0 }}>FS</div>
          <div>
            <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: 14 }}>Fortune Sacco</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.5px" }}>CIC Insurance Portal</div>
          </div>
        </div>

        <nav style={{ padding: "12px 8px", flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "rgba(255,255,255,0.3)", padding: "8px 8px 4px" }}>Navigation</div>
          {visibleNav.map(n => {
            const active = pathname === n.path || (n.path !== "/" && pathname.startsWith(n.path));
            return (
              <div key={n.path} onClick={() => navigate(n.path)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, cursor: "pointer", fontSize: 13, color: active ? "#fcd34d" : "rgba(255,255,255,0.65)", fontWeight: 500, marginBottom: 1, background: active ? "rgba(245,158,11,0.15)" : "transparent", transition: "all 0.15s" }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <Icon name={n.icon} size={16} color={active ? "#f59e0b" : undefined} />
                {n.label}
                {n.path === "/claims" && pendingClaims > 0 && (
                  <span style={{ marginLeft: "auto", background: "#ef4444", color: "white", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>{pendingClaims}</span>
                )}
              </div>
            );
          })}
        </nav>

        <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "#f59e0b", color: "#0a2540", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{user?.avatar}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "white", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{user?.role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* ── Topbar ── */}
        <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "0 24px", height: 60, display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "Sora,sans-serif", fontSize: 18, fontWeight: 700, color: "#0a3d62" }}>
              {NAV.find(n => n.path === pathname || (n.path !== "/" && pathname.startsWith(n.path)))?.label || "Dashboard"}
            </div>
            <div style={{ fontSize: 11, color: "#64748b" }}>Fortune Sacco CIC Insurance Management System</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ background: "#eff6ff", color: "#0a3d62", border: "1px solid #bfdbfe", padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
              <Icon name="building" size={12} style={{ verticalAlign: -2, marginRight: 4 }} />{branchName}
            </span>

            {/* Notifications */}
            <div style={{ position: "relative" }} ref={notifRef}>
              <button onClick={() => setShowNotif(v => !v)} style={{ width: 36, height: 36, border: "1px solid #e2e8f0", borderRadius: 8, background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", position: "relative" }}>
                <Icon name="bell" size={16} />
                {unread > 0 && <span style={{ position: "absolute", top: 5, right: 5, width: 8, height: 8, background: "#ef4444", borderRadius: "50%", border: "2px solid white" }} />}
              </button>

              {showNotif && (
                <div style={{ position: "absolute", top: 44, right: 0, width: 340, background: "white", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 12px 32px rgba(0,0,0,0.12)", zIndex: 200, overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <strong style={{ fontSize: 13 }}>Notifications {unread > 0 && <span style={{ background: "#ef4444", color: "white", fontSize: 10, padding: "1px 6px", borderRadius: 10 }}>{unread}</span>}</strong>
                    <button onClick={handleMarkAllRead} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#0a3d62", fontWeight: 600 }}>Mark all read</button>
                  </div>
                  <div style={{ maxHeight: 360, overflowY: "auto" }}>
                    {notifs.length === 0 && <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No notifications</div>}
                    {notifs.map(n => (
                      <div key={n.id} style={{ padding: "10px 16px", borderBottom: "1px solid #f8fafc", display: "flex", gap: 10, cursor: "pointer", background: !n.is_read ? "#f0f9ff" : "white" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: typeColor[n.type] || "#94a3b8", flexShrink: 0, marginTop: 5 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{n.title}</div>
                          {n.message && <div style={{ fontSize: 11, color: "#64748b" }}>{n.message}</div>}
                          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>{new Date(n.created_at).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleLogout} title="Logout" style={{ width: 36, height: 36, border: "1px solid #e2e8f0", borderRadius: 8, background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
              <Icon name="logout" size={15} />
            </button>
          </div>
        </div>

        {/* ── Page content ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
