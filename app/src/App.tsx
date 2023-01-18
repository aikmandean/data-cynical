import { createMemo, createResource, createRoot, createSignal, For, Match, Show, Switch } from "solid-js";
import { ctxLocalStorage, DIMENSION, setStoreQueryLimit, setStoreTableVisible, storeQuery, storeQueryLimit, storeTableVisible } from "./Context";
import { NewConnect } from "./Features/DbConnect/NewConnect";
import { NewTable, setNewTable } from "./Features/QueryNew/TableNew";
import { SqlWindow } from "./Features/QueryView/Query";
import { Class, Tw, useRef } from "./xlib/Ref";
import { queryConn, updateConn } from "./Features/DbConnect/@context";
import { FormNew as NewForm } from "./Features/FormEdit/Form";
import { API } from "./Url";

// #region CSS
const [tabBtn, leftSideH] = useRef();

createRoot(() => <>
	<Class {...leftSideH} class={`
		text-xs font-semibold px-2 py-1
		bg-emerald-200 text-emerald-900
		border-t-2 border-b border-t-slate-100 border-b-slate-500
	`} />
	<Class {...tabBtn} class={`
		text-xs ml-2 p-1
		bg-gray-300 border border-gray-600 border-b-0
		hover:translate-y-px 
		aria-selected:translate-y-px aria-selected:bg-gray-100
	`} />
</>)
// #endregion

function App() {

	const visibleTable = createMemo(() => storeQuery[storeTableVisible()]);
	const [sidePane, setSidePane] = createSignal<"QUERY"|"FORM"|"CONNECT">("QUERY");
	const [dbTables] = createResource(() => API.dbQuery({ rawQueryString: 
		queryConn.listDbTables() })
		.then(x => x.map(y => (y as any).name))
		, x => x);

	return (
		<div>
			<NewTable />
			
			<NewConnect />
			
			<section class="grid h-screen" style={`grid-template-columns: ${DIMENSION.aside.w} ${DIMENSION.main.w}`}>
				<aside class="bg-stone-50 border-r-2 border-r-stone-400">
					<div class="h-screen overflow-auto bg-white">
						<div class="pt-1 border-b bg-emerald-500 border-gray-600">
							<button {...tabBtn} 
								onClick={() => setSidePane("QUERY")}
								aria-selected={sidePane() == "QUERY"} 
								>Queries</button>
							<button {...tabBtn} 
								onClick={() => setSidePane("FORM")}
								aria-selected={sidePane() == "FORM"} 
								>Forms</button>
							<button {...tabBtn} 
								onClick={() => setSidePane("CONNECT")}
								aria-selected={sidePane() == "CONNECT"} 
								>Connection</button>
						</div>
						<Switch>
							<Match when={sidePane() == "QUERY"}>

								<Tw class="text-xs py-1 px-4 w-full font-semibold" />
								<Tw class="bg-gray-200 text-emerald-800 hover:bg-emerald-400" />
								<button onClick={() => setNewTable(true)}>+ New</button>

								{/* <h3 {...leftSideH}>Pinned</h3> */}

								<h3 {...leftSideH}>All</h3>

								<For each={Object.entries(storeQuery)}>
									{([queryId, query], i) => <>

										<Tw class="block text-xs cursor-pointer py-1 px-2 w-full text-left" />
										<Tw class="hover:bg-slate-200 aria-selected:bg-slate-300" />	
										<Tw class="disabled:text-gray-500 disabled:cursor-default disabled:hover:bg-white" />
										<button
											aria-selected={storeTableVisible() == queryId}
											onClick={() => setStoreTableVisible(queryId)}>
											{queryId} &nbsp;
											<small><i>{query.anyCmd.is.toUpperCase().slice(3)}</i></small>
										</button>

									</>}
								</For>

								<h3 {...leftSideH}>Database Tables</h3>

								<For each={dbTables()}>
									{table => <>

										<Tw class="block text-xs cursor-pointer py-1 px-2 w-full text-left" />
										<Tw class="hover:bg-slate-200" />
										<Tw class="disabled:text-gray-500 disabled:cursor-default disabled:hover:bg-white" />
										<button disabled>{table}</button>

									</>}
								</For>

							</Match>
							<Match when={sidePane() == "FORM"}>
								<NewForm />
							</Match>
							<Match when={sidePane() == "CONNECT"}>
								<h3 {...leftSideH}>Limit</h3>

								<Tw class="m-2 px-2" />
								<input 
									value={storeQueryLimit()} 
									type="number" 
									onChange={e => setStoreQueryLimit(e.currentTarget.valueAsNumber)} 
								/>

								<br />

								<h3 {...leftSideH}>App Save</h3>
								<Tw class="block w-full text-xs text-left py-1 pl-2 font-semibold" />
								<Tw class="text-lime-800 hover:bg-lime-200" />
								<button onClick={() => ctxLocalStorage.stateSave()}>
									In Browser
								</button>
								<Tw class="block w-full text-xs text-left py-1 pl-2 font-semibold" />
								<Tw class="text-lime-800 hover:bg-lime-200" />
								<button onClick={() => {
									const json = JSON.stringify(ctxLocalStorage.stateToObject(), undefined, 4)
									const url = URL.createObjectURL(new Blob([json], {
										type: 'text/json'
									}))
									open(url)
								}}>
									Download
								</button>
								<Tw class="block w-full text-xs text-left py-1 pl-2 font-semibold" />
								<Tw class="text-lime-800 hover:bg-lime-200" />
								<button onClick={() => {
									const x = <input hidden type="file" /> as any as HTMLInputElement
									document.body.appendChild(x)
									x.oninput = async () => {
										if(!x.files) return
										const json = await x.files[0].text()
										x.remove()
										ctxLocalStorage.stateLoadFromJSON(json)
									}
									x.click()
								}}>
									Load File
								</button>

								<br />
								<h3 {...leftSideH}>Database</h3>
								<Tw class="w-full pl-2 py-1 text-xs text-left font-semibold" />
								<Tw class="text-lime-800 hover:bg-lime-200" />
								<button onClick={updateConn.disconnect}>
									Logout
								</button>

							{/* <br /><br />
							<label>
								<b>Ignore Limit for Query</b> <br />
								<input 
									type="checkbox" 
									onChange={() => setIgnoreLimit((x: boolean) => !x)} 
								/>
							</label> */}

							</Match>
						</Switch>
						
					</div>		
				</aside>
				<div class="bg-stone-50">
					<Show when={storeTableVisible() && visibleTable()}>
						<SqlWindow
							limit={storeQueryLimit()} 
							setLimit={storeQueryLimit} 
							toQueries={storeQuery}
							toQuery={visibleTable()}
							queryId={storeTableVisible()}
							showNewTable={() => setNewTable(true)} 
						/>
					</Show>
				</div>
			</section>
		</div>
	);
}

export default App;