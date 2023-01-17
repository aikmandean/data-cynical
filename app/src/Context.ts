import { createSignal } from "solid-js";
import { createStore, unwrap } from "solid-js/store";
import { TDC } from "../../d-c-core/";
import { APIProps } from "./Url";

export const 

ctxLocalStorage = {
	stateToObject() {
		return {
			storeQueryLimit: storeQueryLimit(),
			storeTableVisible: storeTableVisible(),
			storeForm: unwrap(storeForm),
			storeQuery: unwrap(storeQuery)
		};
	},
	stateSave() {
		localStorage.setItem("DC_APP", 
			JSON.stringify(ctxLocalStorage.stateToObject(), undefined, 4));
	},
	stateLoad(props: any) {
		const {
			storeQueryLimit,
			storeTableVisible,
			storeForm,
			storeQuery
		} = props;
		setStoreQueryLimit(storeQueryLimit);
		setStoreTableVisible(storeTableVisible);
		setStoreForms(storeForm);
		setStoreQuery(storeQuery);
	},
	stateLoadFromJSON(json: string) {
		ctxLocalStorage.stateLoad(JSON.parse(json));
	},
	stateLoadAuto() {
		const s = localStorage.getItem("DC_APP");
		if(!s) return;
		ctxLocalStorage.stateLoadFromJSON(s);
	}
},

val = (e: { currentTarget: any }) => ({ value: e.currentTarget.value, checked: e.currentTarget.checked }),

[storeQueryLimit, setStoreQueryLimit] = createSignal(25),

[storeTableVisible, setStoreTableVisible] = createSignal(""),

[storeDb, setStoreDb] = createStore({
	uDatabase: "SQLITE" as APIProps["dbConnect"]["database"],
	uConnectionString: null as any as APIProps["dbConnect"]["connectionString"],
    showModal: true
}),

[storeForm, setStoreForms] = createStore<typeof TDC["ToFunc"]["toFunc"]>({
}),

[storeQuery, setStoreQuery] = createStore<typeof TDC["ToQueries"]["toQueries"]>({
}),

DIMENSION = {
	aside: {
		w: "14rem"
	},
	main: {
		w: "calc(100vw - 14rem)",
		h: "100vh",
		c: "#f1f1f1"
	}
} as const;

ctxLocalStorage.stateLoadAuto();