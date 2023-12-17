import algoliasearch from "algoliasearch";
import axios from "axios";
import { Product } from "~/types/product";
import { Record } from "~/types/records";

const limit = 50;

export async function POST(req: Request) {
  const payload = await req.json() as {
    products: Record[];
    offset: number;
    firstTime?: "yes" | undefined;
    lastUsedKeyIndex?: number | undefined;
  };

  var products: Record[] = payload.products;
  var offset = payload.offset;
  const firstTime = payload.firstTime ? payload.firstTime === "yes" ? true : false : false;

  var lastUsedKeyIndex = payload.lastUsedKeyIndex ? Math.floor(payload.lastUsedKeyIndex) : 0;
  if (lastUsedKeyIndex >= 3 || lastUsedKeyIndex < 0) {
    lastUsedKeyIndex = 0;
  }
  const keys = [
    process.env.POS_API_KEY_1,
    process.env.POS_API_KEY_2,
    process.env.POS_API_KEY_3,
    process.env.POS_API_KEY_4,
  ];
  const key = keys[lastUsedKeyIndex];
  lastUsedKeyIndex++;
  try {
    var haveMore = true;
    var url = `https://bakesbyish.reddotcodes.site/index.php/api/v1/items?limit=${limit}`;
    if (offset !== 0) {
      url += `&offset=${offset}`;
    }

    const res = await axios.get<Product[]>(url, {
      headers: {
        "x-api-key": key,
      },
    });
    if (res.data.length !== limit) {
      haveMore = false;
    }
    const records: Record[] = [];
    res.data.map((product, n) => {
      records[n] = {
        objectID: product.item_id,
        ID: product.item_id,
        Name: product.name,
        Description: product.description,
        Price: product.unit_price,
        Cost: product.cost_price,
      };
    });

    products = [...products, ...records];
    const client = algoliasearch(process.env.ALGOLIA_ID, process.env.ALGOLIA_WRITE_KEY);
    const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME);
    if (firstTime) {
      await index.setSettings({
        searchableAttributes: [
          "ID",
          "Name",
          "Description",
          "Price",
        ],
      });
    }
    await index.saveObjects(products);

    console.log(`[${offset}] : [SecretKeyIndex : ${lastUsedKeyIndex}] => [Products : ${products.length}]`);

    if (haveMore) {
      fetch(`${process.env.DOMAIN}/api/backup`, {
        method: "POST",
        body: JSON.stringify({
          products: products,
          offset: offset + limit,
          lastUsedKeyIndex: lastUsedKeyIndex,
        }),
      });
    }
  } catch (error) {
    console.error(error);
  }

  if (firstTime) {
    return Response.json({
      "status": "Backing up ... ",
    }, {
      status: 200,
    });
  }

  return Response.json(null, {
    status: 200,
  });
}
