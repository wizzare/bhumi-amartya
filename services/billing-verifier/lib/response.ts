export function sendJson(res: { status: (code: number) => { json: (body: unknown) => void }; setHeader: (name: string, value: string) => void }, status: number, body: Record<string, unknown>) {
  res.setHeader("Cache-Control", "no-store");
  res.status(status).json(body);
}
