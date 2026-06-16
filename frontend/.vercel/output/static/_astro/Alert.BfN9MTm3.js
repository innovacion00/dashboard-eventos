import{r as f}from"./index.CVf8TyFT.js";/* empty css                      */var p={exports:{}},s={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var _=f,c=Symbol.for("react.element"),m=Symbol.for("react.fragment"),x=Object.prototype.hasOwnProperty,y=_.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,d={key:!0,ref:!0,__self:!0,__source:!0};function u(t,r,o){var e,n={},l=null,i=null;o!==void 0&&(l=""+o),r.key!==void 0&&(l=""+r.key),r.ref!==void 0&&(i=r.ref);for(e in r)x.call(r,e)&&!d.hasOwnProperty(e)&&(n[e]=r[e]);if(t&&t.defaultProps)for(e in r=t.defaultProps,r)n[e]===void 0&&(n[e]=r[e]);return{$$typeof:c,type:t,key:l,ref:i,props:n,_owner:y.current}}s.Fragment=m;s.jsx=u;s.jsxs=u;p.exports=s;var a=p.exports;function E({children:t,variant:r="info",onClose:o}){return a.jsxs("div",{className:`alert alert--${r}`,role:"alert",children:[a.jsx("span",{className:"alert-content",children:t}),o&&a.jsx("button",{type:"button",className:"alert-close",onClick:o,"aria-label":"Cerrar",children:"×"})]})}export{E as A,a as j};
