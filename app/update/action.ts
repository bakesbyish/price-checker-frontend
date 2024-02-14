
type R = {
  status: "pending" | "processing" | "success" | "failed",
  nextPage: number;
  message: string;
}

export async function update(payload: {
  offset: number,
  limit?: number,
}): Promise<R> {
  const res = await fetch(`/api/updater?offset=${payload.offset}&limit=${payload.limit ?? 1}`)
  return <R>(await res.json());
}

