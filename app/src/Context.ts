import { createStore } from "solid-js/store";
import { CRaw, CSelect, CWhere, SqlNew } from "./CtxSql";
import { APIProps } from "./Url";

export type C = CRaw | CSelect | CWhere;

export const [store, setStore] = createStore({
	all: [
		{ windowKey: { visible: true }, query: SqlNew.raw("Example", "SELECT 1") },
	]
})

export const dimension = Object.freeze({
	aside: {
		w: "18em"
	},
	main: {
		w: "calc(100vw - 18em)",
		h: "100vh",
		c: "#f1f2ed"
	}
})