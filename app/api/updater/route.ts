import { NextRequest } from "next/server";
import { z } from "zod";
import { env } from "~/env";
import { saveRecords } from "~/server/algolia";
import { Item, ZodItem } from "~/types/pos";
import { Record } from "~/types/records";

export const dynamic = "force-dynamic";

const keys = [
  env.POS_API_KEY_1,
  env.POS_API_KEY_2,
  env.POS_API_KEY_3,
  env.POS_API_KEY_4,
]

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  let offset = parseInt(searchParams.get("offset") ?? "0")
  try {
    z.number().int().parse(offset)
  } catch (error) {
    console.error(error)
    offset = 0
  }

  let limit = parseInt(searchParams.get("limit") ?? "100");
  let key = parseInt(searchParams.get("key") ?? `${parseInt(`${Math.random() * keys.length}`)}`);
  try {
    z.number().int().gte(1).lte(100).parse(limit)
  } catch (error) {
    console.error(error)
    limit = 100
  }
  try {
    z.number().int().gte(0).lte(keys.length).parse(key);
  } catch (error) {
    console.error(error)
    key = parseInt(`${Math.random() * keys.length}`)
  }

  const url = `https://bakesbyish.reddotcodes.site/index.php/api/v1/items?limit=${limit}&offset=${offset}`
  const res = await fetch(url, {
    headers: {
      "x-api-key": keys[key]
    }
  })
  if (!res.ok) {
    console.log(await res.json())
    return Response.json({
      status: "Failed to fetch products",
      nextPage: offset,
    })
  }
  const payload = <Item[]>(await res.json())

  try {
    ZodItem.array().parse(payload)
  } catch (error) {
    console.error(error)
    return Response.json({
      status: "Internal server error",
      nextPage: offset,
    })
  }

  const records: Record[] = [];
  let newOffset = -1;

  for (const item of payload) {
    if (!item.product_id || !item.name) {
      continue
    }

    records.push({
      objectID: `${item.item_id}`,
      ID: item.product_id,
      Name: item.name,
      Description: item.description,
      Price: item.unit_price,
      Cost: item.cost_price,
      Quantity: `${item.locations["1"].quantity}`
    })
  }

  if (payload.length === limit) {
    newOffset = offset + limit;
  }

  try {
    await saveRecords(records)
  } catch (error) {
    console.error(error)
    return Response.json({
      status: "Failed to save products",
      nextPage: offset,
    })
  }

  return Response.json({
    status: "Okay",
    nextPage: newOffset,
  })
}
