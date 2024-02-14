"use client";

import { useMutation } from "@tanstack/react-query";
import {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { update } from "./action";
import LoadingDots from "~/components/ui/loading-dots";

type TData = {
	id: number;
	message: string;
	status: "pending" | "processing" | "success" | "failed";
	offset: number;
	limit: number;
};

const generateFakeData = (totalRecords: number): TData[] => {
	const fakeData: TData[] = [];
	for (let i = 0; i < totalRecords; i++) {
		fakeData.push({
			id: i + 1, // Start IDs from 1
			message: `This is a fake message ${i + 1}`,
			// @ts-ignore
			status: ["pending", "processing", "success", "failed"][
				Math.floor(Math.random() * 4)
			],
			offset: Math.floor(Math.random() * 100), // Random offset between 0 and 100
			limit: Math.floor(Math.random() * 10) + 1, // Random limit between 1 and 10
		});
	}
	return fakeData;
};

export default function Updater() {
	const [data, setData] = useState<TData[]>([]);

	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState({});

	const { mutateAsync: reqUpdate, status: updateStatus } = useMutation({
		mutationKey: ["update"],
		mutationFn: update,
	});

	const columns: ColumnDef<TData>[] = [
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => (
				<div className="capitalize">{row.getValue("status")}</div>
			),
		},
		{
			accessorKey: "message",
			header: "Message",
			cell: ({ row }) => <div className="">{row.getValue("message")}</div>,
		},
		{
			id: "actions",
			enableHiding: false,
			cell: ({ row }) => {
				const info = row.original;

				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuItem
								onClick={async () => {
									if (updateStatus === "pending") return;

									let tmp = [...data];
									let index = tmp.findIndex((d) => d.id === info.id);
									tmp[index].status = "pending";
									setData(tmp);

									const res = await reqUpdate({
										offset: info.offset,
										limit: info.limit,
									});

									tmp = [...data];
									index = tmp.findIndex((d) => d.id === info.id);
									tmp[index] = {
										id: res.nextPage,
										offset: res.nextPage,
										status: res.status,
										limit: info.limit,
										message: res.message,
									};
									setData(tmp);
								}}
							>
								Run again
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
	});

	return (
		<main className="flex flex-col items-center justify-center p-4">
			<div className="w-full sm:max-w-2xl mt-8">
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead key={header.id}>
												{header.isPlaceholder
													? null
													: flexRender(
															header.column.columnDef.header,
															header.getContext(),
													  )}
											</TableHead>
										);
									})}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow key={row.id}>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center"
									>
										No results.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			<Button
				onClick={async () => {
					let offset = 0;
					while (offset !== -1) {
						const res = await reqUpdate({
							offset,
							limit: 100,
						});
						setData((prevState) => {
							return [
								...prevState,
								{
									status: res.status,
									id: res.nextPage,
									message: res.message,
									offset: res.nextPage,
									limit: 1,
								},
							];
						});
						offset = res.nextPage;
					}
				}}
				className="mt-8 w-72"
				disabled={updateStatus === "pending"}
			>
				{updateStatus === "pending" ? (
					<LoadingDots className="bg-white" />
				) : (
					"Update the search indexes"
				)}
			</Button>
		</main>
	);
}
