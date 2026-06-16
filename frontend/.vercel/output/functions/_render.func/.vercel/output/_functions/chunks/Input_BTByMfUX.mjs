import { jsxs, jsx } from 'react/jsx-runtime';
/* empty css                        */

function Input({ label, id, error, hint, required, ...props }) {
  return /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
    label && /* @__PURE__ */ jsxs("label", { className: "input-label", htmlFor: id, children: [
      label,
      required && /* @__PURE__ */ jsx("span", { className: "input-required", "aria-hidden": "true", children: "*" })
    ] }),
    /* @__PURE__ */ jsx(
      "input",
      {
        id,
        className: `input-control ${error ? "input-control--error" : ""}`,
        "aria-invalid": error ? "true" : void 0,
        "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : void 0,
        required,
        ...props
      }
    ),
    error && /* @__PURE__ */ jsx("span", { id: `${id}-error`, className: "input-error", role: "alert", children: error }),
    hint && !error && /* @__PURE__ */ jsx("span", { id: `${id}-hint`, className: "input-hint", children: hint })
  ] });
}

export { Input as I };
