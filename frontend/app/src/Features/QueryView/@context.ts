import { fn } from "@hwyblvd/st";
import { createStore } from "solid-js/store";
import { TDC } from "../../../../d-c-core";
import { unionFrom } from "../../../../d-c-core/dcc/@types";

export const 

[queryCols, setQueryCols] = createStore<Record<string, string[]>>({}),

updateWindow = {
	results: fn(props => 
		props.data?.length &&
			setQueryCols(props.queryId, Object.keys(props.data[0]))	
	, { queryId: "", data: {} as any })
},

queryWindow = {
	columns: fn(props => {
		const query = props.toQueries[props.queryId]
		if(!query) return []
		const duplicateCols = [...(queryCols[props.queryId] || [])]
		/** @ts-ignore */
		const add = (...arrs) => arrs.map(x => duplicateCols.push(...(x||[])))

		// unionFrom({
		// 	fromRaw: from => add(queryCols[from.raw]),
		// 	fromUse: from => 
		// 		add(
		// 			queryCols[from.use],
		// 			queryWindow.columns({ ...props, queryId: from.use })
		// 		)
		// 	,
		// })(query.anyFrom)(query.anyFrom)

		// query.toJoin.forEach(join => 
		// 	props.toQueries[join.to] && 
		// 		add(queryWindow.columns({ ...props, queryId: join.to }))
		// )

		return [...new Set(duplicateCols)]
	}, { queryId: "" }, TDC.ToQueries),
	columnsNameFull: fn(props => {
		const query = props.toQueries[props.queryId]
		if(!query) return []
		const duplicateCols = [] // [...(queryCols[props.queryId] || [])]
			.map(col => `${props.queryId}.${col}`)
		/** @ts-ignore */
		const add = (...arrs) => arrs.map(x => duplicateCols.push(...(x||[])))

		unionFrom({
			fromRaw: from => add(queryCols[from.raw]
				?.map(col => `${from.raw}.${col}`)),
			fromUse: from => 
				add(
					queryCols[from.use]
						?.map(col => `${from.use}.${col}`),
					// queryWindow.columnsNameFull({ ...props, queryId: from.use })
				)
			,
		})(query.anyFrom)(query.anyFrom)

		query.toJoin.forEach(join => 
			props.toQueries[join.to] && 
			add(
				queryCols[join.to]
					?.map(col => `${join.to}.${col}`)
			)
				// add(queryWindow.columnsNameFull({ ...props, queryId: join.to }))
		)
		
		return [...new Set(duplicateCols)]
	}, { queryId: "" }, TDC.ToQueries)
}