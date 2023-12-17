import { redirect } from "next/navigation";

export default async function Backup() {
  await fetch("http://localhost:3000/api/backup", {
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
