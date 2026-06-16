import { defineMiddleware } from 'astro:middleware';

const PUBLIC_ROUTES = ['/login'];

export const onRequest = defineMiddleware(async ({ url, cookies, redirect }, next) => {
  const isPublic = PUBLIC_ROUTES.includes(url.pathname);
  const token = cookies.get('auth_token')?.value;

  if (!isPublic && !token) {
    return redirect('/login');
  }

  if (isPublic && token) {
    return redirect('/dashboard');
  }

  return next();
});
