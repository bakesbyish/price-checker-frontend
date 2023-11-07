"use client";
import { useMutation } from "@tanstack/react-query";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useState } from "react";
import { Icons } from "~/components/ui/icons";
import { Input } from "~/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { search } from "~/server/algolia";

export default function Home() {
  const { data: data, mutateAsync: fetchRecords, status, reset } = useMutation({
    mutationFn: search,
  });
  const [value, setValue] = useState("");

  const getRecords = useCallback(
    debounce(async (query: string) => {
      if (query.length === 0 || query.length >= 20) {
        reset();
        return;
      }

      await fetchRecords(query);
    }, 500),
    [],
  );

  useEffect(() => {
    getRecords(value);

    // eslint-disable-next-line
  }, [value]);

  return (
    <main className="flex flex-col items-center  min-h-screen mt-10">
      <div className="flex flex-col items-center justify-center max-w-xl w-full">
        <Input
          className="w-72 sm:w-96"
          placeholder="search by Name or SKU ... "
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
        />

        <div className="w-72 sm:w-full mt-12">
          {status === "pending"
            ? (
              <div className="flex flex-col items-center justify-center">
                <Icons.spinner className="mr-2 h-12 w-12 animate-spin" />
              </div>
            )
            : (
              <>
                {data && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">SKU</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((record, n) => (
                        <TableRow key={n}>
                          <TableCell>{record.objectID}</TableCell>
                          <TableCell>{record.Name}</TableCell>
                          <TableCell>{record.Price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </>
            )}
        </div>
      </div>
    </main>
  );
}
