import { jsxs, jsx } from 'react/jsx-runtime';
/* empty css                        */

function Button({ children, variant = "primary", size = "md", type = "button", disabled, loading, onClick, ...props }) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type,
      className: `btn btn--${variant} btn--${size} ${loading ? "btn--loading" : ""}`,
      disabled: disabled || loading,
      onClick,
      ...props,
      children: [
        loading ? /* @__PURE__ */ jsx("span", { className: "btn-spinner", "aria-hidden": "true" }) : null,
        /* @__PURE__ */ jsx("span", { children })
      ]
    }
  );
}

export { Button as B };
