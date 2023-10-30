"use client";
import { useMutation } from "@tanstack/react-query";
import debounce from "lodash.debounce";
import { getRequestMeta } from "next/dist/server/request-meta";
import { useCallback, useEffect, useState } from "react";
import { Icons } from "~/components/ui/icons";
import { Input } from "~/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { productsAPI } from "~/lib/api";
import { Record } from "~/types/records";

export default function Home() {
  const { data: data, mutateAsync: fetchRecords, status, reset } = useMutation({
    mutationFn: async (query: string) => {
      try {
        const res = await productsAPI.post<{
          status: string;
          records?: Record[] | undefined;
        }>("/search", {
          "query": query,
        });

        if (res.data.records === undefined || !Array.isArray(res.data.records)) {
          return {
            records: [],
          };
        }

        return {
          records: res.data.records,
        };
      } catch (error) {
        console.error(error);
        return {
          records: [],
        };
      }
    },
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
                      {data.records.map((record, n) => (
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
