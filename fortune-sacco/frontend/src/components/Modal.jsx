import Icon from "./Icon";

const Modal = ({ open, onClose, title, children, footer, size = "md" }) => {
  if (!open) return null;
  const maxW = size === "lg" ? 820 : size === "sm" ? 420 : 640;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20, backdropFilter: "blur(4px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: maxW, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px rgba(0,0,0,0.25)" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "white", zIndex: 10 }}>
          <h3 style={{ fontFamily: "Sora, sans-serif", fontSize: 16, fontWeight: 700, color: "#0a3d62", margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex" }}>
            <Icon name="x" size={18} />
          </button>
        </div>
        <div style={{ padding: "20px 24px" }}>{children}</div>
        {footer && <div style={{ padding: "16px 24px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 10 }}>{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
