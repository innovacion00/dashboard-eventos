import { jsx, jsxs } from 'react/jsx-runtime';
import { useEffect } from 'react';
/* empty css                        */

function Modal({ open, title, onClose, children, size = "md" }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  if (!open) return null;
  return /* @__PURE__ */ jsx("div", { className: "modal-overlay", onClick: onClose, role: "dialog", "aria-modal": "true", "aria-labelledby": "modal-title", children: /* @__PURE__ */ jsxs("div", { className: `modal modal--${size}`, onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsx("h2", { id: "modal-title", className: "modal-title", children: title }),
      /* @__PURE__ */ jsx("button", { className: "modal-close", onClick: onClose, "aria-label": "Cerrar", children: "×" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "modal-body", children })
  ] }) });
}

export { Modal as M };
