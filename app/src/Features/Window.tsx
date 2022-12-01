import { declareProps, fn } from "@hwyblvd/st"
import { batch, createResource, createRoot, createSignal, Show } from "solid-js"
import { C, dimension, setStore } from "../Context"
import { SqlRender, transcribeQuery } from "../CtxSql"
import { API } from "../Url"
import { Style, useRef } from "../xlib/Ref"
import { WindowTable } from "./Table"

// #region Context

export const { WindowKey, ShowNewTable, Id, Query, Limit, SetLimit } = declareProps({
	windowKey: { visible: true },
	showNewTable: () => {},
	query: {} as C,
	id: 0,
	limit: 0,
	setLimit: (n: number) => {}
})

export const updateWindow = {
	tableVisible(i: number, status: boolean) {
		setStore("all", i, "windowKey", "visible", status)
	}
}

// #endregion

// #region CSS

const [div, navIn, navOut] = useRef();

createRoot(() => <>
	<Style {...div} 
		background={dimension.main.c}
		position={"absolute"}
		width={dimension.main.w}
		height={dimension.main.h}
		overflow={"auto"}
	/>
	<Style {...navIn}
		margin-bottom={"1em"}
		border-radius={".5em"}
		padding={"1em"}
	/>
	<Style {...navOut}
		position={"fixed"}
		left={0}
		right={0}
		width={"26em"}
		bottom={"2em"}
		margin={"auto"}
		border-radius={".5em"}
		padding={".75"}
		display={"flex"}
		justify-content={"space-around"}
		box-shadow={"0 0 .5em 0 #2221 inset, 0 0 .75 0 #0008"}
		background={"white"}
	/>
</>);

// #endregion 

export const SqlWindow = fn(props => {
	
	const [showEdit, setShowEdit] = createSignal(false);
	const [showGrouping, setShowGrouping] = createSignal(false);
	const [ignoreLimit, setIgnoreLimit] = createSignal(false);

	const [data] = createResource(() => 
		API.dbQuery({ rawQueryString: `${transcribeQuery(props.query)} ${ignoreLimit() ? "" : `LIMIT ${props.limit}`}` })
	, x => x);

	const updateQuery = {
		text: (e: { currentTarget: { value: string } }) =>
			batch(() => {
				setStore("all", props.id, "query", "sqlValue", e.currentTarget.value)
				setStore("all", props.id, "query", "sqlWith", props.query.sqlAlias, SqlRender[props.query.sqlCommand]
					// @ts-ignore
					(props.query)
					[props.query.sqlAlias])
			}),
		command: (e: { currentTarget: { value: string } }) =>
			setStore("all", props.id, "query", "sqlCommand", e.currentTarget.value as any),
	};

	const EditWindow = () => (
		<nav {...navIn}>
			<label>
				<b>Query Command</b> <br />
				<select onChange={updateQuery.command} value={props.query.sqlCommand}>
					<option textContent="Select" value="select" />
					<option textContent="Where" value="where" />
					<option textContent="RAW" value="raw" />
				</select>
			</label>

			<br /><br /><hr /><br />

			<label>
				<b>SQL</b> <br />
				<textarea onChange={updateQuery.text} value={props.query.sqlValue} cols="60" rows="12" />
			</label>
			
			<br /><br /><hr /><br />
			
			<label>
				<b>Limit</b> <br />
				<input value={props.limit} type="number" onChange={e => props.setLimit(e.currentTarget.valueAsNumber)}  />
			</label>
			<br /><br />
			<label>
				<b>Ignore Limit for Query</b> <br />
				<input type="checkbox" onChange={() => setIgnoreLimit(x => !x)} />
			</label>
		</nav>
	)

	return (
		<div {...div}>
			<h3>{props.query.sqlAlias}</h3>

			<Show when={showEdit()}>
				<EditWindow />
			</Show>
			
			<WindowTable data={data()||[]} showGrouping={showGrouping()} />
			
			<nav {...navOut}>
				<button onClick={() => updateWindow.tableVisible(props.id, false)}>Close</button>
				<button onClick={() => props.showNewTable()}>New</button>
				<button	classList={{active: showEdit()}} onClick={() => setShowEdit(x => !x)}>Edit</button>
				<button>Download</button>
				<button classList={{active: showGrouping()}} onClick={() => setShowGrouping(x => !x)}>Group&nbsp;By</button>
			</nav>
		</div>
	)
}, WindowKey, Query, Id, ShowNewTable, Limit, SetLimit);