import { declareProps, fn } from "@hwyblvd/st"
import { createEffect, createMemo } from "solid-js"
import { createStore } from "solid-js/store"
import { storeForm, storeQuery } from "../../Context"

export const 

{ AliasId, I, QueryId, Config, ShowNewTable, Id, Limit, SetLimit, SetIgnoreLimit, AliasName, Value } = declareProps({
	config: { visible: true },
	showNewTable: () => {},
	id: 0,
	limit: 0,
	setLimit: (n: number) => {},
	setIgnoreLimit: (n: any) => 0 as any,
	aliasName: "",
	value: "",
    queryId: "",
    i: 0,
    aliasId: ""
}),

UpdateQueryEdit = {} as ReturnType<typeof useUpdateQuery>,
UpdateQueryMacro = {} as ReturnType<typeof useUpdateMacro>,

useUpdateQuery = fn(p => {
    const setStore = createMemo(() => createStore(storeQuery[p.queryId])[1])
    createEffect(() => setStore()("toFunc", storeForm))
    
    return ({
        updateQueryEdit: {
            join: {
                reTable: fn(props => 
                    setStore()("toJoin", props.i, "to", props.value)
                , I, Value),
                reType: fn(props => 
                    setStore()("toJoin", props.i, "type", props.value as any)
                , I, Value),
                reOn: fn(props => 
                    setStore()("toJoin", props.i, "on", props.value as any)
                , I, Value),
                new: fn(props => 
                    setStore()("toJoin", storeQuery[p.queryId].toJoin.length, { type: "INNER", on: "", to: "" })
                )
            },
            from: {
                asUse: fn(props => 
                    setStore()("anyFrom", { is: "fromUse", use: props.value })
                , Value)
            },
            cmd: {
                where: {
                    condition: fn(props => 
                        setStore()("anyCmd", "condition" as any, props.value)
                    , Value),
                },
                raw: {
                    expression: fn(props =>
                        setStore()("anyCmd", "raw" as any, props.value)
                    , Value)
                },
                do: {
                    set: fn(props => 
                        setStore()("anyCmd", "is", props.value as any)
                    , Value)   
                }
            },
            alias: {
                defCol: fn(props => setStore()("toAlias", "colNew", { is: "aliasDefCol", def: "exampleCol" })),
                defExpr: fn(props => setStore()("toAlias", "colNew", { is: "aliasDefExpr", def: "exampleCol / 100" })),
                call: fn(props => setStore()("toAlias", "colNew", { is: "aliasCall", call: "exampleFunc", params: {} })),
            }
        }
    })
}, QueryId),

useUpdateMacro = fn(p => {
    const setToAlias = createMemo(() => createStore(storeQuery[p.queryId].toAlias)[1])
    const setAlias = createMemo(() => createStore(storeQuery[p.queryId].toAlias[p.aliasId])[1])
    return {
        updateMacro: {
            defCol: {
                set: fn(props => 
                    setAlias()("def" as any, props.value)
                , Value),
            },
            defExpr: {
                set: fn(props =>
                    setAlias()("def" as any, props.value as any)
                , Value),
            },
            call: {
                func: fn(props => 
                    setAlias()({ is: "aliasCall", call: props.value, params: Object.fromEntries(Object.keys(storeForm[props.value].params).map(x => [x,""])) })
                , Value),
                params: fn(props => 
                    setAlias()("params" as any, props.paramId, props.value)
                , Value, { paramId: "" })
            },
            do: {
                name: fn(props => {
                    setToAlias()(props.value, storeQuery[p.queryId].toAlias[p.aliasId])
                    setToAlias()(p.aliasId, undefined as any)
                }, Value),
                type: fn(props => 
                    props.value[0] == "C" ? setAlias()("is", "aliasDefCol") :
                    props.value[0] == "R" ? setAlias()("is", "aliasDefExpr") :
                    props.value[0] == "F" ? setAlias()("is", "aliasCall") : {}
                , Value)
            }
        }
    }
}, QueryId, AliasId)