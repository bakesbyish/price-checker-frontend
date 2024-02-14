
type R = {
  status: "pending" | "processing" | "success" | "failed",
  nextPage: number;
}

export async function update(offset: number, limit = 1): Promise<R> {
  const res = await fetch(`/api/updater?offset=${offset}&limit=${limit}`)
  const payload = <R>(await res.json());
  return payload
}

