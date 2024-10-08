"use server";
import "server-only";

import algoliasearch from "algoliasearch";
import { env } from "~/env";
import { Record } from "~/types/records";

export async function search(key: string): Promise<Record[]> {
  const client = algoliasearch(env.ALGOLIA_ID, env.ALGOLIA_WRITE_KEY);
  const index = client.initIndex(env.ALGOLIA_INDEX_NAME);

  const res = await index.search(key, {
    hitsPerPage: 1000,
  });
  return res.hits as unknown as Record[];
}

export async function saveRecords(records: Record[]) {
  const client = algoliasearch(
    env.NEXT_PUBLIC_ALGOLIA_ID,
    env.ALGOLIA_WRITE_KEY,
  );
  const index = client.initIndex(env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME);

  await index.saveObjects(records);
}
