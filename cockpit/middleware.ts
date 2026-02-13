import { NextResponse, type NextRequest } from 'next/server';

// Minimal soft-gate to avoid accidental exposure.
// If MC_UI_BASIC_AUTH is set (format: "user:pass"), require HTTP Basic Auth.
export function middleware(req: NextRequest) {
  const basic = process.env.MC_UI_BASIC_AUTH;
  if (!basic) return NextResponse.next();

  const auth = req.headers.get('authorization') || '';
  const expected = 'Basic ' + Buffer.from(basic).toString('base64');

  if (auth !== expected) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: {
        'www-authenticate': 'Basic realm="Cockpit"',
        'cache-control': 'no-store',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
