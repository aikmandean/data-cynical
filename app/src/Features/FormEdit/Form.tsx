import { declareProps, fn } from "@hwyblvd/st";
import { createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { storeForm, setStoreForms, val } from "../../Context";
import { Tw } from "../../xlib/Ref";

// #region private
const 

{ Value, I } = declareProps({
    formId: "",
    value: "",
    i: 0,
}),

useFormNew = fn(props => {
    const [formNewId, setFormNewId] = createSignal("formNew")
    const [formNewExpr, setFormNewExpr] = createSignal("param2 - param1")
    const [formNewModal, setFormNewModal] = createSignal(false)
    const [paramList, setParams] = createStore(["param1","param2"] as string[])
    const api = {
        queryFormNew: {
            get modalShow() { return formNewModal() },
            get paramList() { return paramList },
            get funcDef() { return formNewExpr() },
            get funcId() { return formNewId() }
        },
        updateFormNew: {
            funcDef: fn(props => setFormNewExpr(props.value), Value),
            funcId: fn(props => setFormNewId(props.value), Value),
            params: {
                add: fn(props => setParams(paramList.length, "NewParam")),
                remove: fn(props => setParams([...paramList.slice(0, props.i), ...paramList.slice(props.i + 1)]), I),
                set: fn(props => setParams(props.i, props.value), Value, I)
            },
            do: {
                open: fn(props => setFormNewModal(true)),
                ok: fn(props => {
                    const params = Object.fromEntries(paramList.map(p => [p,""]))
                    setStoreForms(formNewId(), { def: formNewExpr(), params })
                    api.updateFormNew.do.closeReset({})
                }),
                closeReset: fn(props => {
                    setFormNewModal(false),
                    setFormNewExpr("param2 - param1")
                    setParams(["param1","param2"])
                    setFormNewId("FormNew")
                })
            }
        }
    }
    return api
});
// #endregion

export const

FormNew = fn(props => {
    const { queryFormNew, updateFormNew } = useFormNew(props)
    return (
        <Show 
            when={queryFormNew.modalShow} 
            fallback={<>

                <Tw class="w-full py-1 text-xs font-semibold" />
                <Tw class="bg-gray-200 text-emerald-800 hover:bg-emerald-400" />
                <button 
                    onClick={() => updateFormNew.do.open({})}
                    >+ Form</button>

                <For each={Object.entries(storeForm)}>
                    {([formId, form]) => (
                        <p class="font-mono p-1 text-xs">{formId}({
                            Object.keys(form.params).join(", ")
                        })</p>
                    )}
                </For>
                
            </>} 
            children={
                <div>
                    <label>
                        {/* Form ID */}
                        <input 
                            class="m-1 p-1 rounded-none text-mono"
                            value={queryFormNew.funcId}
                            onChange={e => updateFormNew.funcId(val(e))} />
                    </label>
                    <label>
                        {/* Expression */}
                        <textarea
                            class="w-full text-sm p-2 font-mono bg-slate-100"
                            cols="10" 
                            rows="5"
                            value={queryFormNew.funcDef}
                            onChange={e => updateFormNew.funcDef(val(e))} />
                    </label>
                    <For each={queryFormNew.paramList}>
                        {(x, i) => (
                            <div class="bg-slate-100 h-6 pl-1">
                                <input 
                                    class="m-0 w-48 text-mono bg-transparent border-none rounded-none"
                                    value={x} 
                                    onChange={e => updateFormNew.params.set({ i: i(), ...val(e) })} />
                                <button 
                                    class="w-6 h-6 text-sm translate-x-1 -translate-y-px font-semibold bg-lime-400 text-lime-800 hover:bg-lime-200"
                                    onClick={() => updateFormNew.params.remove({ i: i() })}
                                    >x</button>
                            </div>
                        )}
                    </For>
                    
                    <Tw class="block w-full text-xs py-1 px-2 mb-1.5 font-semibold" />
                    <Tw class="text-slate-800 bg-slate-300 hover:bg-slate-200" />
                    <button
                        onClick={() => updateFormNew.params.add({})}
                        >+ Param</button>
                        
                    <Tw class="block w-full text-xs py-1 px-2 font-semibold" />
                    <Tw class="text-emerald-800 bg-emerald-400 hover:bg-emerald-200" />
                    <button 
                        onClick={() => updateFormNew.do.ok({})}
                        >Done</button>
                    <Tw class="block w-full text-xs py-1 px-2 font-semibold" />
                    <Tw class="text-lime-800 bg-lime-400 hover:bg-lime-200" />
                    <button 
                        onClick={() => updateFormNew.do.closeReset({})}
                        >Cancel</button>
                </div>
            }    
        />
    )
});