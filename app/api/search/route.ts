import { z } from "zod";
import { search } from "~/server/algolia";

export async function POST(req: Request) {
	const body = await req.json();
	try {
		z.object({
			search: z.string().min(1).max(100),
		}).parse(body);
	} catch (error) {
		console.error(error);
		return Response.json(
			{
				status: "bad_request",
			},
			{
				status: 400,
			},
		);
	}

	const records = await search(body.search);
	return Response.json(
		records.map((record) => {
			return {
				ObjectID: record.objectID,
				ID: record.ID,
				Name: record.Name,
				Price: record.Price,
				Cost: record.Cost,
				Quantity: record.Quantity,
			};
		}),
	);
}
