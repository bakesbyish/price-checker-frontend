import { redirect } from "next/navigation";

export default async function Backup() {
  await fetch(`${process.env.DOMAIN}/api/backup`, {
    method: "POST",
    body: JSON.stringify({
      "products": [],
      "offset": 0,
      "firstTime": "yes",
    }),
    cache: "no-store",
  });

  redirect("/");
}
