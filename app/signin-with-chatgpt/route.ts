export const dynamic = "force-dynamic";

function safeReturn(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/workspace";
  return value;
}

export function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = safeReturn(url.searchParams.get("return_to"));
  const secure = url.protocol === "https:";
  const headers = new Headers();
  headers.set("Location", returnTo);
  headers.set("Cache-Control", "private, no-store");
  headers.set(
    "Set-Cookie",
    `__sites_local_auth=1; Path=/; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`,
  );
  return new Response(null, {
    status: 302,
    headers,
  });
}

