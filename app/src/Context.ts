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

[storeTableVisible, setStoreTableVisible] = createSignal("MsgFilter"),

[storeDb, setStoreDb] = createStore({
	uDatabase: "SQLITE" as APIProps["dbConnect"]["database"],
	uConnectionString: null as any as APIProps["dbConnect"]["connectionString"],
    showModal: true
}),

[storeForm, setStoreForms] = createStore<typeof TDC["ToFunc"]["toFunc"]>({
	telIsUS: { def: "subStr(colTel, 2) == '+1'", params: { colTel: "" } }
}),

[storeQuery, setStoreQuery] = createStore<typeof TDC["ToQueries"]["toQueries"]>({
	Msg: { 
		anyCmd: { is: "cmdRaw", raw: `SELECT * FROM message` },
		anyFrom: { is: "fromRaw", raw: "" }, 
		toAlias: {}, toFunc: {}, toJoin: []
	},
	MsgFilter: {
		anyCmd: { is: "cmdWhere", condition: "true" },
		anyFrom: { is: "fromUse", use: "Msg" }, 
		toAlias: {
			msgText: { is: "aliasDefCol", def: "text" },
			msgSender: { is: "aliasDefCol", def: "handle_id" },
			msgDate: { is: "aliasDefCol", def: "date" },
			msgIsFromMe: { is: "aliasDefCol", def: "is_from_me" },
			senderTel: { is: "aliasDefExpr", def: "Hndl.id" },
			senderIsUS: { is: "aliasCall", call: "telIsUS", params: { colTel: "senderTel" } },
		}, 
		toFunc: { telIsUS: { ...storeForm.telIsUS } }, 
		toJoin: [
			{ to: "Hndl", type: "LEFT", on: "msgSender = Hndl.ROWID" }
		]
	},
	Room: {
		anyCmd: { is: "cmdRaw", raw: `SELECT * FROM chat` },
		anyFrom: { is: "fromRaw", raw: "" }, 
		toAlias: {}, toFunc: {}, toJoin: []
	},
	Hndl: {
		anyCmd: { is: "cmdRaw", raw: `SELECT * FROM handle` },
		anyFrom: { is: "fromRaw", raw: "" }, 
		toAlias: {}, toFunc: {}, toJoin: []
	},
	HndlFilter: {
		anyCmd: { is: "cmdWhere", condition: "true" },
		anyFrom: { is: "fromUse", use: "Hndl" }, 
		toAlias: {}, toFunc: {}, toJoin: []
	},
	MsgHndl: {
		anyCmd: { is: "cmdWhere", condition: "true" },
		anyFrom: { is: "fromUse", use: "MsgFilter" }, 
		toAlias: {}, toFunc: {}, toJoin: [
			{ to: "HndlFilter", on: "", type: "LEFT" }
		]
	},
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