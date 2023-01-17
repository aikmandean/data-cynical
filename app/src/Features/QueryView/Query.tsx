import { fn, MHide } from "@hwyblvd/st";
import { createEffect, createResource, createRoot, createSignal } from "solid-js";
import { DIMENSION } from "../../Context";
import { API } from "../../Url";
import { Class, Tw, useRef } from "../../xlib/Ref";
import { EditSelect } from "../QueryEdit/Edit";
import { WindowTable } from "../ResultTable";
import { updateWindow } from "./@context";
import { renderQueryComplete, TDC } from "../../../../d-c-core";
import { unionCmd } from "../../../../d-c-core/dcc/@types";
import { portalFrom, portalRaw, portalWhere } from "./@props";


// #region CSS
const [tabBtn, navGroup] = useRef();

createRoot(() => <>
	<Class {...navGroup} class={`
		inline-block pl-5 pr-1 -translate-y-1 
		text-stone-200 font-bold
	`} />
	<Class {...tabBtn} class={`
		text-xs ml-2 p-1
		hover:translate-y-px 
		bg-gray-300 border border-gray-600 border-b-0
		aria-selected:translate-y-px aria-selected:bg-gray-100
	`} />
</>);
// #endregion 

export const 

SqlWindow = fn(props => {
	
	const [showGrouping, setShowGrouping] = createSignal(true);
	const [ignoreLimit, setIgnoreLimit] = createSignal(false);
	const query = () => renderQueryComplete(props);
	const [data] = createResource(async () => {
		try {
			const q = query();
			console.log({props, query: q});
			if(!q) return [];
			return API.dbQuery({ rawQueryString: ""
				+ q
				+ (ignoreLimit() ? "" : ` LIMIT ${props.limit}`) 
			});
		} catch { return []; }
	}, x => x);

	createEffect(() => updateWindow.results({ ...props, data: data() }));
	const [routeMain, setRouteMain] = createSignal<"EDIT:SELECT"|"EDIT:WHERE"|"EDIT:FROM"|"EDIT:RAW"|"VIEW:RUN"|"VIEW:EXPORT">("EDIT:SELECT");

	return <>
		<Tw class="query-view-root" />
		<Tw class="absolute h-screen overflow-auto bg-gray-200" />
		<div style={`width: ${DIMENSION.main.w}`}>

			<style textContent={`
				.query-view-root > section > div > div > div > * {
					height: calc(50vh - (2.75rem / 2));
					overflow: auto;
				}

				.query-view-root > section > div {
					max-width: ${DIMENSION.main.w};
					max-height: calc(100vh - 2.75rem);
					overflow: auto;
				}
			`} />

			<Tw class="flex h-11 items-end" />
			<Tw class="border-b border-b-gray-600 bg-emerald-600" />
			<header>
				<div>
					<small {...navGroup}>Edit</small>
					<button {...tabBtn} 
						aria-selected={routeMain() == "EDIT:SELECT"}
						onClick={() => setRouteMain("EDIT:SELECT")}
						>Select</button>
					{unionCmd({
						cmdRaw: () => <button {...tabBtn} 
							aria-selected={routeMain() == "EDIT:RAW"}
							onClick={() => setRouteMain("EDIT:RAW")}
							>Raw</button>,
						cmdSelect: () => <></>,
						cmdWhere: () => <button {...tabBtn} 
							aria-selected={routeMain() == "EDIT:WHERE"}
							onClick={() => setRouteMain("EDIT:WHERE")}
							>Where</button>,
					})(props.toQuery.anyCmd)(props.toQuery.anyCmd)}
					<button {...tabBtn} 
						aria-selected={routeMain() == "EDIT:FROM"}
						onClick={() => setRouteMain("EDIT:FROM")}
						>From</button>
				</div>
				<div>
					<small {...navGroup}>View</small>
					<button {...tabBtn} 
						aria-selected={routeMain() == "VIEW:RUN"}
						onClick={() => setRouteMain("VIEW:RUN")}
						>Run</button>
					<button {...tabBtn} 
						aria-selected={routeMain() == "VIEW:EXPORT"}
						onClick={() => setRouteMain("VIEW:EXPORT")}
						>Export</button>
				</div>	
				<small class="block ml-auto mr-2 text-lg text-white font-semibold">
					{props.queryId}
				</small>
			</header>

			<section>
				<div class="hidden aria-selected:block" 
					aria-selected={routeMain() == "EDIT:WHERE"}>
					<div {...portalWhere}><div></div></div>
				</div>
				<div class="hidden aria-selected:block" 
					aria-selected={routeMain() == "EDIT:FROM"}>
					<div {...portalFrom}><div></div></div>
				</div>
				<div class="hidden aria-selected:block" 
					aria-selected={routeMain() == "EDIT:RAW"}>
					<div {...portalRaw}><div></div></div>
				</div>
				<div class="hidden aria-selected:block" 
					aria-selected={routeMain() == "EDIT:SELECT"}>
					<div>
						<EditSelect {...props} setIgnoreLimit={setIgnoreLimit} />
					</div>
				</div>
				<div hidden={routeMain() != "VIEW:RUN"}
					aria-selected={routeMain() == "VIEW:RUN"}>
					<WindowTable data={data()||[]} showGrouping={showGrouping()} />
				</div>
				<div class="hidden aria-selected:block" 
					aria-selected={routeMain() == "VIEW:EXPORT"}>
					<div class="p-4">
						<h3 class="text-lg font-semibold text-emerald-800"
							>Copy Query</h3>
						<textarea 
							class="w-full text-xs font-mono py-4 px-6 text-gray-700"
							value={query()}
							cols="30" 
							rows="10" />
						<br /><br />
						<h3 class="text-lg font-semibold text-emerald-800"
							>Download</h3>
						<button
							onClick={async () => {
								const { csvContent } = await API.dbDownload({ rawQueryString: `${query()} LIMIT ${props.limit}` })
								open(csvContent)
							}} 
							class="block text-xs mb-1 py-1 px-4 text-white bg-emerald-500 hover:bg-emerald-700"
							>Snapshot</button>
						<button
							onClick={async () => {
								const { csvContent } = await API.dbDownload({ rawQueryString: query() })
								open(csvContent)
							}}
							class="block text-xs mb-1 py-1 px-4 text-white bg-lime-500 hover:bg-lime-700"
							>Whole Table</button>
					</div>
				</div>
			</section>
		</div>
	</>;
}, MHide(EditSelect, { setIgnoreLimit: true }), { showNewTable: () => {} }, TDC.ToQueries);