import { d as defineMiddleware, s as sequence } from './chunks/render-context__wlG1_m3.mjs';
import 'es-module-lexer';
import './chunks/astro-designed-error-pages_DKwf7-yL.mjs';
import 'cookie';

const PUBLIC_ROUTES = ["/login"];
const onRequest$1 = defineMiddleware(async ({ url, cookies, redirect }, next) => {
  const isPublic = PUBLIC_ROUTES.includes(url.pathname);
  const token = cookies.get("auth_token")?.value;
  if (!isPublic && !token) {
    return redirect("/login");
  }
  if (isPublic && token) {
    return redirect("/dashboard");
  }
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
