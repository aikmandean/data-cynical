import { declareProps, fn } from "@hwyblvd/st"
import { createSolidTable, flexRender, getCoreRowModel, getExpandedRowModel, getGroupedRowModel } from "@tanstack/solid-table"
import { createEffect, createMemo, createRoot, createSignal, For, Match, Show, Switch } from "solid-js"
import { DIMENSION } from "../Context"
import { Style, useRef } from "../xlib/Ref"

const 

{ Data, ShowGrouping } = declareProps({
	showGrouping: false,
	data: [{}]
}),

[tbl] = useRef();

createRoot(() => <Style {...tbl} 
	min-width={DIMENSION.main.w}
	font-size={".8em"}
/>);

export const WindowTable = fn(props => {
	
	const cols = createMemo(() => props.data[0] && Object.keys(props.data[0]));
	const [aggs, setAggs] = createSignal<string[]>([]);

	createEffect(() => setAggs(cols()?.map(() => "count") || []));
	
	// Attempt to not reset the row models when group by column changes.
	const tableModel = createMemo(() => ({
		getCoreRowModel: getCoreRowModel(),
		getGroupedRowModel: getGroupedRowModel(),
		getExpandedRowModel: getExpandedRowModel()
	}));
	
	const table = createMemo(() => createSolidTable({
		data: props.data, 
		// @ts-ignore
		columns: cols()?.map((c, i) => ({
			accessorKey: c,
			enableGrouping: true,
			aggregationFn: aggs()[i]
		})) || [],
		...tableModel()
	}));

	return (
		<table {...tbl}>
			<thead>
				<For each={table()?.getHeaderGroups() || []} children={headerGroup => (
					<tr>
						<For each={headerGroup.headers} children={header => 
							<th colSpan={header.colSpan}>
								<Show when={!header.isPlaceholder} children={
									<Show when={props.showGrouping}
										children={
											<div
												style={{cursor: `${header.column.getCanGroup() ? "pointer" : "auto"}`}}
												onClick={header.column.getToggleGroupingHandler()}
											>
												{flexRender(
													header.column.columnDef.header,
													header.getContext()
												)}
												{header.column.getIsGrouped() && " ⬇️"}
											</div>
										}
										fallback={
											<div>
												{flexRender(
													header.column.columnDef.header,
													header.getContext()
												)}
											</div>
										}
									/>
								} />
							</th>
						} />
					</tr>
				)} />
				<Show when={props.showGrouping}>
					<For each={table()?.getHeaderGroups() || []} children={headerGroup => (
						<tr>
							<For each={headerGroup.headers} children={header => 
								<th colSpan={header.colSpan}>
									<Show when={!header.isPlaceholder && !header.column.getIsGrouped()} children={
										<select 
											onClick={e => e.stopPropagation()}
											onChange={e => {
												const id = cols().indexOf(header.column.id)
												console.log({id}, e.currentTarget.value)
												setAggs(a => (a.splice(id, 1, e.currentTarget.value), a.slice()))
											}}
											value={header.column.getAggregationFn()?.name}
										>
											<option textContent="count"/>
											<option textContent="sum"/>
											<option textContent="min"/>
											<option textContent="max"/>
											<option textContent="extent"/>
											<option textContent="mean"/>
											<option textContent="median"/>
											<option textContent="unique"/>
											<option textContent="uniqueCount"/>
										</select>
									} />
								</th>
							} />
						</tr>
					)} />
				</Show>
			</thead>
			<tbody>
				<For each={table().getRowModel().rows}>
					{row => (
						<tr>
							<For each={row.getVisibleCells()}>
								{cell => 
									<td style={{ background: 
										cell.getIsGrouped() 
											? 'rgb(10 56 127 / 75%)' : 
										cell.getIsAggregated()
											? '#8467332c' : 
										cell.getIsPlaceholder()
											? '#3a175c42' : 'transparent'
									}}>
										
										<Switch>
											<Match when={cell.getIsGrouped()} children={
												<button
													onClick={row.getToggleExpandedHandler()}
													style={{ cursor: row.getCanExpand() ? 'pointer' : 'normal' }}
												>
													{row.getIsExpanded() ? '👇' : '👉'}{' '}
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext()
													)}
												</button>
											} />
											<Match when={cell.getIsAggregated()} children={
												flexRender(
													cell.column.columnDef.aggregatedCell ??
													cell.column.columnDef.cell,
													cell.getContext()
												)
											} />
											<Match when={!cell.getIsPlaceholder()} children={
												// For cells with repeated values, render null
												// Otherwise, just render the regular cell
												flexRender(
													cell.column.columnDef.cell,
													cell.getContext()
												)
											} />
											<Match when={cell.getIsPlaceholder()} children={null} />
										</Switch>
									</td>
								}
							</For>
						</tr>
					)}
				</For>
			</tbody>
		</table>
	);
}, Data, ShowGrouping);