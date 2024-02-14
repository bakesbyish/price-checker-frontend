"use client";
import { useMutation } from "@tanstack/react-query";
import debounce from "lodash.debounce";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { search } from "~/client/algolia";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/ui/icons";
import { Input } from "~/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";

export default function Home() {
	const {
		data,
		mutateAsync: fetchRecords,
		status,
		reset,
	} = useMutation({
		mutationFn: search,
	});
	const [value, setValue] = useState("");

	const tableRef = useRef<HTMLTableSectionElement | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);

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

	useEffect(() => inputRef.current?.focus(), []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		getRecords(value);
	}, [value]);

	return (
		<main className="flex flex-col items-center  min-h-screen mt-10">
			<section className="bottom-0 fixed bg-white/70 p-1 text-sm font-semibold text-black backdrop-blur-lg dark:bg-black/70 dark:text-white w-full">
				<Link
					className="inline-flex bg-pink-500 p-2 text-white rounded-md"
					href={"/update"}
				>
					Update
				</Link>
			</section>
			<div className="flex flex-col items-center justify-center max-w-xl w-full">
				<section className="flex items-center justify-center w-full gap-2">
					<Input
						ref={inputRef}
						className="w-72 sm:w-96"
						placeholder="search by Name or SKU ... "
						value={value}
						onChange={(event) => setValue(event.currentTarget.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								if (status === "pending" || !data) {
									return;
								}

								navigator.clipboard.writeText(data[0].objectID);
							}
						}}
					/>
				</section>

				<div className="w-72 sm:w-full mt-12">
					{status === "pending" ? (
						<div className="flex flex-col items-center justify-center">
							<Icons.spinner className="mr-2 h-12 w-12 animate-spin" />
						</div>
					) : (
						<>
							{data && (
								<Table className="w-full">
									<TableHeader>
										<TableRow>
											<TableHead className="">SKU</TableHead>
											<TableHead className="w-16 sm:w-full truncate">
												Name
											</TableHead>
											<TableHead>Price</TableHead>
											<TableHead>Quantity</TableHead>
											<TableHead>Cost</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody ref={tableRef}>
										{data.map((record) => (
											<TableRow
												id={record.objectID}
												key={record.objectID}
												tabIndex={0}
												onKeyDown={(e) => {
													e.stopPropagation();
													const currentRow =
														tableRef.current?.children.namedItem(
															record.objectID,
														);
													switch (e.key) {
														case "Enter":
															navigator.clipboard.writeText(record.objectID);
															break;
														case "ArrowUp":
															// @ts-ignore
															currentRow?.previousElementSibling?.focus();
															break;
														case "ArrowDown":
															// @ts-ignore
															currentRow?.nextElementSibling?.focus();
															break;
														case "Backspace":
															setValue("");
															inputRef.current?.focus();
															break;
													}
												}}
											>
												<TableCell
													className="hover:bg-slate-100 cursor-pointer"
													onClick={() =>
														navigator.clipboard.writeText(record.objectID)
													}
												>
													{record.ID}
												</TableCell>
												<TableCell
													className="hover:bg-slate-100 cursor-pointer"
													onClick={() =>
														navigator.clipboard.writeText(record.Name)
													}
												>
													{record.Name}
												</TableCell>
												<TableCell>{record.Price}</TableCell>
												<TableCell>{record.Quantity}</TableCell>
												<TableCell>{record.Cost}</TableCell>
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
