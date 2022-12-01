import { createMemo, createRoot, createSignal, For, Match, Show, Switch } from "solid-js";
import { C, dimension, store } from "./Context";
import { newConn, NewConnect, updateConn } from "./Features/NewConnect";
import { NewTable, newTable, setNewTable, updateNewTable } from "./Features/TableNew";
import { SqlWindow, updateWindow, WindowKey } from "./features/Window";
import { Style, useRef } from "./xlib/Ref";

const [limit, setLimit] = createSignal(25);

// #region CSS

const [section, aside, divIn, divOut, logout] = useRef();
createRoot(() => <>
	<Style {...section} 
		display={"grid"}
		grid-template-columns={`${dimension.aside.w} ${dimension.main.w}`}
		height={dimension.main.h}
	/>
	<Style {...aside}
		background={dimension.main.c}
		padding={"2em"}
	/>
	<Style {...divIn}
		background={"white"}
		border-radius={".5em"}
		padding={".5em"}
	/>
	<Style {...divOut}
		background={dimension.main.c}
	/>
	<Style {...logout}
		border-radius={".5em"}
		background={"#ab5042"}
		color={"white"}
		border={"none"}
		padding={".2em .6em"}
	/>
</>);

// #endregion

function App() {

	const visibleTable = createMemo(() => {
		let latest = null as any as typeof WindowKey & { query: C }
		for (const tbl of store.all) 
			if(tbl.windowKey.visible)
				latest = tbl
		return latest
	});

	return (
		<div>
			<Switch>
				<Match when={newConn.showModal} children={<NewConnect />} />
				<Match when={newTable.showModal} children={<NewTable />} />
				<Match when={true} children={
					<section {...section}>
						<aside {...aside}>
							<div {...divIn}>
								<h3>Queries</h3>
								<For each={store.all}>
									{(x, i) => (
										<p>
											<input onChange={e => updateWindow.tableVisible(i(), e.currentTarget.checked)} type="checkbox" checked={x.windowKey.visible} />
											<b>{x.query.sqlAlias}</b> &nbsp;
											<small><i>{x.query.sqlCommand.toUpperCase()}</i></small>
										</p>
									)}
								</For>
								<Show when={visibleTable() && visibleTable().query.sqlFrom?.length}>
									<hr />
									<h3>From</h3>
									<b>{visibleTable().query.sqlFrom[0].sqlAlias}</b>
									<br /><br /><hr />
									<h3>Join</h3>
									<For each={visibleTable().query.sqlFrom.slice(1)}>
										{tbl => (
											<p>
												<b>{tbl.sqlAlias}</b> <br />
												<small>
													{tbl.join} JOIN {tbl.sqlAlias} ON <br />
													{tbl.sqlValue}
												</small>
											</p>
										)}
									</For>
								</Show>
								<button {...logout} onClick={updateConn.disconnect}>Logout</button>
							</div>
							
						</aside>
						<div {...divOut}>
							<For each={store.all}>
								{(x, i) => (
									<Show when={x.windowKey.visible}>
										<SqlWindow 
											{...x} 
											limit={limit()} 
											setLimit={setLimit} 
											id={i()} 
											showNewTable={() => setNewTable("showModal", true)} 
										/>
									</Show>
								)}
							</For>
						</div>
					</section>
				} />	
			</Switch>
		</div>
	);
}

export default App;