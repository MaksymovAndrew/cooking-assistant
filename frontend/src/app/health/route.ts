// container liveness only: the one route handler, outside the api-layer rule on purpose
export const dynamic = "force-dynamic";

// answering from the route cache would prove the file exists, not that the runtime still renders
export const GET = (): Response => new Response("ok");
