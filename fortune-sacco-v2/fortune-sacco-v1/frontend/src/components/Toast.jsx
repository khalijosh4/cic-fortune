import { useToast } from "../context/ToastContext";
import Icon from "./Icon";

const TYPE_CONFIG = {
  success: { icon: "checkCircle", color: "#10b981", border: "#10b981" },
  error:   { icon: "xCircle",     color: "#ef4444", border: "#ef4444" },
  warning: { icon: "alert",       color: "#f59e0b", border: "#f59e0b" },
  info:    { icon: "info",        color: "#3b82f6", border: "#3b82f6" },
};

const Toast = () => {
  const { toasts } = useToast();

  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map(t => {
        const cfg = TYPE_CONFIG[t.type] || TYPE_CONFIG.info;
        return (
          <div key={t.id} style={{ background: "white", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", borderLeft: `4px solid ${cfg.border}`, minWidth: 280, maxWidth: 360, animation: "toast-in 0.3s ease" }}>
            <Icon name={cfg.icon} size={18} color={cfg.color} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{t.title}</div>
              {t.message && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{t.message}</div>}
            </div>
          </div>
        );
      })}
      <style>{`@keyframes toast-in{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
    </div>
  );
};

export default Toast;
