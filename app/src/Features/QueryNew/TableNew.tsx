import { fn } from "@hwyblvd/st";
import { For, Show } from "solid-js";
import { unionCmd } from "../../../../d-c-core/dcc/@types";
import { storeQuery, val } from "../../Context";
import { Tw } from "../../xlib/Ref";
import { queryNew, queryNewId, queryNewModal, setQueryNew, setQueryNewId, setQueryNewModal, updateQueryNew } from "./@context";

// #region private
const 

TableList = () => <>
    <option value="-1">Pick a table</option>
    <For each={Object.entries(storeQuery)}>
        {([queryId, query]) => (
            <option value={queryId}>
                {queryId} ({query.anyCmd.is.slice(3)})
            </option>
        )}
    </For>
</>,

Internal = fn(props => <>
    <Tw class="fixed grid w-screen h-screen z-10" />
    <Tw class="backdrop-filter backdrop-blur-sm bg-slate-200 bg-opacity-60" />
    <aside>
        <Tw class="m-auto w-96 h-96 pt-8 p-4" />
        <Tw class="bg-white" />
        <section>
            <nav>
                {unionCmd({
                    cmdRaw: cmd => <>
                        <div>
                            <b>Include</b> <br />
                            <For each={queryNew.toJoin}>
                                {(q, i) => (
                                    <div>
                                        <select 
                                            class="font-mono text-xs"
                                            onChange={e => updateQueryNew.join.reTable({ i: i(), ...val(e) })}>
                                            <TableList />
                                        </select>
                                    </div>
                                )}
                            </For>
                            <button onClick={() => updateQueryNew.join.new({})}>Add a table</button>
                        </div>
                        <br /><hr /><br />
                    </>,
                    cmdWhere: cmd => {},
                    cmdSelect: cmd => {},
                })(queryNew.anyCmd)(queryNew.anyCmd) 
                ||
                    <>
                        <div class="flex justify-between">
                            <b>From</b>
                            <select 
                                class="font-mono text-xs"
                                onChange={e => updateQueryNew.from.asUse(val(e))}>
                                <TableList />
                            </select>
                        </div>
                        <br /><hr /><br />
                    </> 
                }

                <div class="flex justify-between">
                    <b>Name</b>
                    <small>
                        <input 
                            value={queryNewId()} 
                            onChange={e => setQueryNewId(e.currentTarget.value)} />
                    </small>
                </div>
                <br /><hr /><br />

                <div class="flex justify-between">
                    <b>Raw Query</b>
                    <small>
                        <input 
                            type="checkbox"
                            checked={queryNew.anyCmd.is == "cmdRaw"} 
                            onChange={e => setQueryNew("anyCmd", "is", e.currentTarget.checked ? "cmdRaw" : "cmdWhere")} />
                    </small>
                </div>
                <br /><hr /><br />

                <div class="flex justify-evenly">
                    <Tw class="bg-emerald-300 py-1 px-4" />
                    <Tw class="hover:bg-emerald-200" />
                    <button 
                        onClick={() => updateQueryNew.do.ok({})}
                        >Done</button>
                    <Tw class="bg-lime-300 py-1 px-4" />
                    <Tw class="hover:bg-lime-200" />
                    <button 
                        onClick={() => updateQueryNew.do.closeReset({})}
                        >Cancel</button>
                </div>
            </nav>
        </section>
    </aside>
</>);
// #endregion

export const 

NewTable = fn(props => 
    <Show when={queryNewModal()}>
        <Internal {...props} />
    </Show>    
, Internal),

setNewTable = setQueryNewModal;