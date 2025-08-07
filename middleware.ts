import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")
  const isDev = process.env.NODE_ENV === "development"

  // Production-optimized CSP that allows Mapbox to function
  const csp = `
    default-src 'self';
    script-src 'self' ${isDev ? "'unsafe-inline' 'unsafe-eval'" : `'nonce-${nonce}'`} https://api.mapbox.com;
    style-src 'self' 'unsafe-inline' https://api.mapbox.com https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.tiles.mapbox.com https://api.mapbox.com;
    connect-src 'self' https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com wss://*.tiles.mapbox.com;
    worker-src 'self' blob:;
    child-src 'self' blob:;
    font-src 'self' data: https://fonts.gstatic.com;
    frame-src 'none';
  `
    .replace(/\s{2,}/g, " ")
    .trim()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Set security headers
  response.headers.set("Content-Security-Policy", csp)
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "origin-when-cross-origin")

  return response
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}
