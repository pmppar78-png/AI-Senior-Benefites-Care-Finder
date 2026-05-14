import type { Config, Context } from "@netlify/edge-functions";

const CANONICAL_HOST = "seniorbenefitscarefinder.com";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);

  if (url.hostname !== CANONICAL_HOST) {
    url.hostname = CANONICAL_HOST;
    url.protocol = "https:";
    url.port = "";
    return new Response(null, {
      status: 301,
      headers: { Location: url.toString() },
    });
  }

  return context.next();
};

export const config: Config = {
  path: "/*",
  onError: "bypass",
};
