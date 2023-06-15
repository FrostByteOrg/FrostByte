import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Database } from '@/types/database.supabase';

export async function middleware(req: NextRequest) {
  console.log(req.url);
  // We need to create a response and hand it to the supabase client to be able to modify the response headers.
  const res = NextResponse.next();
  // Forward req if User tries to reset password, authorization will happen on the client
  // console.log(req.cookies.has('supabase-auth-token'));
  if (
    req.nextUrl.pathname == '/passwordreset' ||
    req.nextUrl.pathname == '/tos' ||
    req.nextUrl.pathname == '/privacy' ||
    req.nextUrl.pathname == '/auth/callback'
  )
    return res;
  // Create authenticated Supabase Client.
  const supabase = createMiddlewareClient<Database>({ req, res });
  // Check if we have a session

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const redirectUrl = req.nextUrl.clone();

  // Check auth condition
  if (session?.user) {
    // Authentication successful, forward request to protected route.

    //Trying to access login route while logged in, redirect to index
    if (req.nextUrl.pathname == '/login') {
      redirectUrl.pathname = '/';
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  }

  // Auth condition not met, redirect to home page.
  if (req.nextUrl.pathname == '/login') return res;
  console.log('bruh');
  redirectUrl.pathname = '/login';
  redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    '/!opengraph*',
    '/((?!favicon.ico|_next|opengraph*).*)',
    '/api/:path*',
  ],
};

// export const config = {
//   matcher: ['/((?!favicon.ico|_next).*)', '/api/:path*'],
// };
