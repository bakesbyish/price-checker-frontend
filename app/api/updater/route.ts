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

type R = {
  status: "pending" | "processing" | "success" | "failed"
  message: string;
  nextPage: number
}

export async function GET(req: NextRequest) {
  const response: R = {
    status: "success",
    nextPage: -1,
  }
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
    response.status = "failed"
    response.nextPage = offset
    response.message = "Failed to fetch products from POS software (Check logs for more information)"
    return Response.json(response)
  }
  const payload = <Item[]>(await res.json())

  try {
    ZodItem.array().parse(payload)
  } catch (error) {
    console.error(error)
    response.status = "failed"
    response.nextPage = offset
    response.message = "Unrecognized data format received from the server"
    return Response.json(response)
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
    response.status = "failed"
    response.nextPage = offset
    response.message = "Failed to save the records in Algolia"
    return Response.json(response)
  }

  response.status = "success"
  response.nextPage = newOffset;
  if (newOffset === -1) response.message = `Saved from ${offset} to ${offset + limit}. Saving ${records.length} from the limit of ${limit}`
  else response.message = `Saved from ${offset} to ${newOffset}. Saving ${records.length} from the limit of ${limit}`

  return Response.json(response)
}
