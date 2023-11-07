"use server";

import algoliasearch from "algoliasearch";
import { Record } from "~/types/records";

export async function search(key: string): Promise<Record[]> {
  const client = algoliasearch(process.env.ALGOLIA_ID, process.env.ALGOLIA_WRITE_KEY);
  const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME);

  const res = await index.search(key);
  return res.hits as unknown as Record[];
}
