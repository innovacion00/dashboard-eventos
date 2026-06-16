import { jsxs, jsx } from 'react/jsx-runtime';
/* empty css                        */

function Select({ label, id, error, required, options = [], placeholder, ...props }) {
  return /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
    label && /* @__PURE__ */ jsxs("label", { className: "input-label", htmlFor: id, children: [
      label,
      required && /* @__PURE__ */ jsx("span", { className: "input-required", "aria-hidden": "true", children: "*" })
    ] }),
    /* @__PURE__ */ jsxs(
      "select",
      {
        id,
        className: `input-control ${error ? "input-control--error" : ""}`,
        "aria-invalid": error ? "true" : void 0,
        required,
        ...props,
        children: [
          placeholder && /* @__PURE__ */ jsx("option", { value: "", children: placeholder }),
          options.map((opt) => /* @__PURE__ */ jsx("option", { value: opt.value, children: opt.label }, opt.value))
        ]
      }
    ),
    error && /* @__PURE__ */ jsx("span", { className: "input-error", role: "alert", children: error })
  ] });
}

export { Select as S };
