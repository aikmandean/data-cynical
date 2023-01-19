import { declareProps, fn } from "@hwyblvd/st"
import { createSignal } from "solid-js"
import { createStore } from "solid-js/store"
import { TDC } from "../../../../d-c-core"
import { setStoreQuery } from "../../Context"

export const 

{ I, Value } = declareProps({
    i: 0,
    value: ""
}),

[queryNewModal, setQueryNewModal] = createSignal(false),

[queryNewId, setQueryNewId] = createSignal("NewQuery"),

[queryNew, setQueryNew] = createStore<typeof TDC["ToQuery"]["toQuery"]>({
    anyCmd: { is: "cmdWhere", condition: "true" },
    anyFrom: { is: "fromRaw", raw: "Example" },
    toAlias: {},
    toFunc: {},
    toJoin: []
}),

updateQueryNew = {
    join: {
        reTable: fn(props => 
            setQueryNew("toJoin", props.i, "to", props.value)
        , I, Value),
        reType: fn(props => 
            setQueryNew("toJoin", props.i, "type", props.value as any)
        , I, Value),
        reOn: fn(props => 
            setQueryNew("toJoin", props.i, "on", props.value as any)
        , I, Value),
        new: fn(props => 
            setQueryNew("toJoin", queryNew.toJoin.length, { type: "INNER", on: "", to: "" })
        )
    },
    from: {
        asUse: fn(props => 
            setQueryNew("anyFrom", { is: "fromUse", use: props.value })
        , Value)
    },
    do: {
        ok: fn(props => {
            setStoreQuery(queryNewId(), { ...queryNew })
            updateQueryNew.do.closeReset({})
        }),
        closeReset: fn(props => {
            setQueryNewModal(false)
            setQueryNew({
                anyCmd: { is: "cmdWhere", condition: "true" },
                anyFrom: { is: "fromRaw", raw: "Example" },
                toAlias: {},
                toFunc: {},
                toJoin: []
            })
        })
    }
}