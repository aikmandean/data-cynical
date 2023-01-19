import { fn } from "@hwyblvd/st";
import { createRoot, createSignal, For, Show } from "solid-js";
import { DIMENSION, storeForm, storeQuery, val } from "../../Context";
import { Class, Tw, Style, useRef } from "../../xlib/Ref";
import { queryWindow } from "../QueryView/@context";
import { TDC } from "../../../../d-c-core";
import { ToQuery, unionAlias, unionCmd, unionFrom } from "../../../../d-c-core/dcc/@types";
import { Limit, QueryId, SetIgnoreLimit, SetLimit, useUpdateMacro, useUpdateQuery, UpdateQueryEdit } from "./@context";
import { Portal } from "solid-js/web";
import { portalFrom, portalRaw, portalWhere } from "../QueryView/@props";

// #region private
const 

[
    portal, 
    tabGroup, tabBtn,
    joinBox, joinBtn, joinListTbl,
    cmdSide, cmdSideList, cmdLi,
    cmdBox, cmdMain, cmdGroup, cmdBtn,
    tableIncludeList, tableInclude, tableIncludeH, tableIncludeCol
] = useRef(),

ViewTablesFloating = fn(props => <>
    <div {...tableIncludeList}>
        {unionFrom({
            fromRaw: from => <Show when={from.raw}>
                <div {...tableInclude}>
                    <h4 data-join="FROM" {...tableIncludeH}><small>FROM</small> {from.raw}</h4>
                    <For fallback={<p {...tableIncludeCol}>No columns cached.</p>} each={queryWindow.columns({ ...props, queryId: from.raw })}>
                        {col => <p {...tableIncludeCol}>{col}</p>}
                    </For>
                </div>
            </Show>,
            fromUse: from => <Show when={from.use}>
                <div {...tableInclude}>
                    <h4 data-join="FROM" {...tableIncludeH}><small>FROM</small> {from.use}</h4>
                    <For fallback={<p {...tableIncludeCol}>No columns cached.</p>} each={queryWindow.columns({ ...props, queryId: from.use })}>
                        {col => <p {...tableIncludeCol}>{col}</p>}
                    </For>
                </div>
            </Show>,
        })(props.toQuery.anyFrom)(props.toQuery.anyFrom)}
        <For each={props.toQuery.toJoin}>
            {(q, i) => (
                <div {...tableInclude}>
                    <h4 data-join={q.type} {...tableIncludeH}><small>{q.type}</small> {q.to}</h4>
                    <For fallback={<p {...tableIncludeCol}>No columns cached.</p>} each={queryWindow.columns({ ...props, queryId: q.to })}>
                        {col => <p {...tableIncludeCol}>{col}</p>}
                    </For>
                </div>
            )}
        </For>
    </div>
</>, ToQuery, queryWindow.columns),

EditFromJoin = fn(props => {
    const [route, setRoute] = createSignal<"FROM"|"JOIN">("FROM")
    
    // Join State
    const [i, setToJoinIdx] = createSignal(0)
    const q = () => props.toQuery.toJoin[i()]
    
    return <>
        <div {...tabGroup}>
            <button {...tabBtn} 
                aria-selected={route() == "FROM"}
                onClick={() => setRoute("FROM")}
                >From</button>
            <button {...tabBtn} 
                aria-selected={route() == "JOIN"}
                onClick={() => setRoute("JOIN")}
                >Join</button>
        </div>
        <div style={route() == "FROM" ? "" : "display:none;"}>
            {unionFrom({
                fromRaw: from => 
                    <select 
                        class="p-4 text-xs w-full font-mono"
                        value={from.raw} 
                        onChange={e => props.updateQueryEdit.from.asUse(val(e))}>
                        <TableList />
                    </select>,
                fromUse: from => 
                <select 
                    class="p-4 text-xs w-full font-mono"
                    value={from.use} 
                    onChange={e => props.updateQueryEdit.from.asUse(val(e))}>
                    <TableList />
                </select>,
            })(props.toQuery.anyFrom)(props.toQuery.anyFrom)}
        </div>
        <Show when={route() == "JOIN"}>
            <div {...joinBox}>
                <div class="bg-slate-100 border-r border-r-slate-400">
                    <For each={props.toQuery.toJoin}>
                        {(q, idx) => (
                            <button {...joinListTbl} 
                                aria-selected={i() == idx()}
                                data-join={q.type}
                                onClick={() => setToJoinIdx(idx())}>
                                {q.to || "<Not Selected>"}
                            </button>
                        )}
                    </For>
                    <Tw class="block w-full py-1 font-semibold" />
                    <Tw class="text-emerald-800 bg-emerald-200 hover:bg-emerald-600" />
                    <button
                        onClick={() => props.updateQueryEdit.join.new({})}
                        >+ Table</button>
                </div>
                <div class="p-4 bg-gray-100">
                    <Show when={q()}>
                        <select 
                            class="px-4 py-2 text-sm border border-gray-300"
                            value={q().to} 
                            onChange={e => props.updateQueryEdit.join.reTable({ i: i(), ...val(e) })}>
                            <TableList />
                        </select>
                        <br /><br />
                        <button {...joinBtn} 
                            data-join="INNER"
                            aria-selected={q().type == "INNER"}
                            onClick={() => props.updateQueryEdit.join.reType({ i: i(), value: "INNER" })}
                            >Inner</button>
                        <button {...joinBtn} 
                            data-join="LEFT"
                            aria-selected={q().type == "LEFT"}
                            onClick={() => props.updateQueryEdit.join.reType({ i: i(), value: "LEFT" })}
                            >Left</button>
                        <button {...joinBtn} 
                            data-join="OUTER"
                            aria-selected={q().type == "OUTER"}
                            onClick={() => props.updateQueryEdit.join.reType({ i: i(), value: "OUTER" })}
                            >Outer</button>
                        <button {...joinBtn} 
                            data-join="CROSS"
                            aria-selected={q().type == "CROSS"}
                            onClick={() => props.updateQueryEdit.join.reType({ i: i(), value: "CROSS" })}
                            >Cross</button>
                        <br /><br />
                        
                        <textarea 
                            class="w-full font-mono px-4 py-2 text-sm border border-gray-300"
                            value={q().on}
                            onChange={e => props.updateQueryEdit.join.reOn({ i: i(), ...val(e) })} 
                            cols="20" 
                            rows="4" 
                        />
                    </Show>
                </div>
            </div>
        </Show>
    </>
}, ToQuery, UpdateQueryEdit),

TableList = fn(() => <>
    <option value="-1">Pick a table</option>
    <For each={Object.entries(storeQuery)}>
        {([queryId, query]) => (
            <option value={queryId}>
                {queryId} ({query.anyCmd.is.slice(3)})
            </option>
        )}
    </For>
</>);
// #endregion private

createRoot(() => <>
    <Class {...tableIncludeList} class={`
        bg-gray-100 text-gray-400
    `} />
    <Style {...tableIncludeList} 
        background-size={"40px 40px"}
        background-attachment={"local"}
        background-image={"radial-gradient(circle, currentColor 1px, rgba(0, 0, 0, 0) 1px)"}
    />
    <Class {...tableInclude} class={`
        w-36 h-48 m-3 float-left overflow-auto
        rounded-t-md
        border border-gray-300 bg-white text-black
    `} />
    <Class {...tableIncludeH} class={`
        data-[join=INNER]:bg-teal-400
        data-[join=CROSS]:bg-pink-400
        data-[join=OUTER]:bg-purple-400
        data-[join=LEFT]:bg-yellow-400
        data-[join=FROM]:bg-emerald-400
        text-sm
        border-b pl-2
    `} />
    <Class {...tableIncludeCol} class={`
        py-1 mx-1 px-1 text-xs border-b border-gray-200
    `} />
    <Class {...tabGroup} class={`
        pt-2 
        border-t border-t-gray-300 border-b border-b-gray-400
    `} />
    <Class {...tabBtn} class={`
        text-xs ml-2 p-1
        bg-gray-300 
        border border-gray-400 border-b-0
        hover:translate-y-px 
        aria-selected:translate-y-px aria-selected:bg-gray-200
    `} />
    <Style {...joinBox} 
        display={"grid"}
        grid-template-columns={"10rem 1fr"}
        height={"calc(100% - 2.4rem)"}
        overflow={"auto"}
    />
    <Class {...joinBtn} class={`
        data-[join=INNER]:text-teal-600
        data-[join=CROSS]:text-pink-600
        data-[join=OUTER]:text-purple-600
        data-[join=LEFT]:text-yellow-600
        data-[join=FROM]:text-emerald-600
        
        text-sm m-1 px-3 bg-gray-200 border border-gray-300
        aria-selected:border-gray-700
    `} />
    <Class {...joinListTbl} class={`
        data-[join=INNER]:text-teal-700
        data-[join=CROSS]:text-pink-700
        data-[join=OUTER]:text-purple-700
        data-[join=LEFT]:text-yellow-700
        data-[join=FROM]:text-emerald-700
        
        block w-full py-1 bg-slate-100
        border-b border-b-gray-200
        hover:bg-slate-200 aria-selected:bg-white
    `} />
    <Style {...cmdBox} 
        display={"grid"}
        grid-template-columns={"1fr 14rem"}
    />
    <Class {...cmdMain} class={`
        bg-gray-100
    `} />
    <Class {...cmdSide} class={`
        bg-slate-100
    `} />
    <Class {...cmdGroup} class={`
        pt-2 
        border-t border-t-gray-300 border-b border-b-gray-400
    `} />
    <Class {...cmdBtn} class={`
        text-xs ml-2 p-1
        bg-gray-300 
        border border-gray-400 border-b-0
        hover:translate-y-px disabled:hover:translate-y-0 disabled:text-gray-500
        aria-selected:translate-y-px aria-selected:bg-gray-200
    `} />
    <Style {...cmdSideList} height={"calc(((100vh - 2.75rem) / 2) - 2.22rem)"} />
    <Class {...cmdSideList} class={`
        p-2 border-l border-l-slate-600 overflow-auto
    `} />
    <Class {...cmdLi} class={`
        text-xs font-mono text-gray-400
    `} />
</>);

export const 

EditSelect = fn(props => {


    const { updateQueryEdit } = useUpdateQuery(props)
    const [selectedAlias, setSelectAlias] = createSignal("")
    const [routeWhere, setRouteWhere] = createSignal<"SQL"|"COLS"|"ALIAS">("SQL")
    const [routeRaw, setRouteRaw] = createSignal<"SQL"|"COLS"|"ALIAS">("SQL")
    return (
    <div>
        <div>
            <table class="text-sm" style={`width: ${DIMENSION.main.w};`}>
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th>Col / Form / Expr</th>
                        {/* <th>Description</th> */}
                    </tr>
                    <For each={Object.entries(props.toQuery.toAlias)}>
                        {([aliasId, alias]) => {
                            const { updateMacro } = useUpdateMacro({ ...props, aliasId })
                            return (
                            <tr 
                                class="aria-selected:bg-slate-300" 
                                aria-selected={aliasId == selectedAlias()}
                                onClick={() => setSelectAlias(aliasId)}>
                                <td class="bg-transparent">
                                    <input 
                                        value={aliasId} 
                                        onChange={e => updateMacro.do.name(val(e))} />
                                </td>
                                <td class="bg-transparent">
                                    <select value={unionAlias({
                                        aliasCall: () => "F",
                                        aliasDefCol: () => "C",
                                        aliasDefExpr: () => "R"
                                    })(alias)(alias)} onChange={e => updateMacro.do.type(val(e))}>
                                        <option value="C" textContent="Column" />
                                        <option value="F" textContent="Form" />
                                        <option value="R" textContent="Expression" />
                                    </select>
                                </td>
                                {/* <td class="bg-transparent">
                                    <input />
                                </td> */}
                                <Show when={selectedAlias() == aliasId}>
                                    <Portal mount={portal.children[0]}>
                                        {unionAlias({
                                            aliasCall: a => <>
                                                <div {...cmdBox}>
                                                    <div {...cmdMain}>
                                                        <div {...cmdGroup}>
                                                            <button disabled {...cmdBtn}
                                                                >Column</button>
                                                            <button disabled {...cmdBtn}
                                                                >Expression</button>
                                                            <button {...cmdBtn}
                                                                aria-selected={true}
                                                                >Form</button>
                                                        </div>
                                                        <div>
                                                            <select 
                                                                class="block w-full font-mono text-xs p-4"
                                                                value={a.call} 
                                                                onChange={e => updateMacro.call.func(val(e))}
                                                                >
                                                                <option textContent="Select a form" />
                                                                <For each={Object.entries(storeForm)}>
                                                                    {([formId,form])=> (
                                                                        <option value={formId}>{formId}({Object.keys(form.params).join(", ")})</option>
                                                                    )}
                                                                </For>
                                                            </select>
                                                            <br />
                                                            <For each={Object.entries(storeForm[a.call]?.params || {})}>
                                                                {([paramId]) => <>
                                                                    <label>
                                                                        <b class="block pl-2 pt-2 text-emerald-800">{paramId}</b>
                                                                        <input 
                                                                            list={`${props.queryId}-${a.call}-${paramId}`}
                                                                            class="block w-full font-mono text-xs p-4 rounded-none"
                                                                            value={a.params[paramId]} 
                                                                            onChange={e => updateMacro.call.params({ paramId, ...val(e) })} />
                                                                        <datalist id={`${props.queryId}-${a.call}-${paramId}`}>
                                                                            <For each={queryWindow.columns(props)}>
                                                                                {x => <option textContent={x} />}
                                                                            </For>
                                                                        </datalist>
                                                                    </label>
                                                                </>}
                                                            </For>
                                                        </div>
                                                    </div>
                                                    <div {...cmdSide}>
                                                        <div {...cmdGroup}>
                                                            <button {...cmdBtn}
                                                                aria-selected={routeWhere() == "SQL"}
                                                                onClick={() => setRouteWhere("SQL")}
                                                                >SQL Funcs</button>
                                                            <button {...cmdBtn}
                                                                aria-selected={routeWhere() == "ALIAS"}
                                                                onClick={() => setRouteWhere("ALIAS")}
                                                                >Aliases</button>
                                                            <button {...cmdBtn}
                                                                aria-selected={routeWhere() == "COLS"}
                                                                onClick={() => setRouteWhere("COLS")}
                                                                >Columns</button>
                                                        </div>
                                                        <div {...cmdSideList}>
                                                            <ul style={routeWhere() == "SQL" ? "" : "display:none"}>
                                                                <For each={"date(),time(),dateTime(),julianDay(),strFTime(),subStr(),trim(),lTrim(),rTrim(),length(),replace(),upper(),lower(),avg(),count(),max(),min(),sum(),group_concat(),".split(",")}>
                                                                    {func => <li {...cmdLi}>{func}</li>}
                                                                </For>
                                                            </ul>
                                                            <ul style={routeWhere() == "ALIAS" ? "" : "display:none"}>
                                                                <For each={Object.keys(props.toQuery.toAlias)}>
                                                                    {alias => <li {...cmdLi}>{alias}</li>}
                                                                </For>
                                                            </ul>
                                                            <ul style={routeWhere() == "COLS" ? "" : "display:none"}>
                                                                <For each={queryWindow.columns(props)}>
                                                                    {col => <li {...cmdLi}>{col}</li>}
                                                                </For>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>,
                                            aliasDefCol: a => <>
                                                <div {...cmdBox}>
                                                    <div {...cmdMain}>
                                                        <div {...cmdGroup}>
                                                            <button {...cmdBtn}
                                                                aria-selected={true}
                                                                >Column</button>
                                                            <button disabled {...cmdBtn}
                                                                >Expression</button>
                                                            <button disabled {...cmdBtn}
                                                                >Form</button>
                                                        </div>
                                                        <div>
                                                            <p class="p-2 pt-6 text-xs">Select column</p>
                                                            <Show 
                                                                when={!a.def || queryWindow.columns(props).includes(a.def)}
                                                                fallback={<>
                                                                    <select 
                                                                        class="w-full p-4 font-mono text-xs"
                                                                        disabled
                                                                    >
                                                                        <option>No columns cached.</option>
                                                                    </select>
                                                                    <p class="w-full p-4 font-mono text-xs">Selected: {a.def}</p>
                                                                </>
                                                                }
                                                                children={
                                                                    <select 
                                                                        class="w-full p-4 font-mono text-xs"
                                                                        value={a.def} 
                                                                        onChange={e => updateMacro.defCol.set(val(e))}>
                                                                        <option textContent="Select a column" />
                                                                        <For each={queryWindow.columns(props)}>
                                                                            {x => <option textContent={x} />}
                                                                        </For>
                                                                    </select>
                                                                }
                                                            />
                                                            <details class="p-2 pt-6 text-xs">
                                                                <summary>Manual column entry</summary>
                                                                <div>
                                                                    <input value={a.def} onChange={e => updateMacro.defCol.set(val(e))} />
                                                                </div>
                                                            </details>
                                                        </div>
                                                    </div>
                                                    <div {...cmdSide}>
                                                        <div {...cmdGroup}>
                                                            <button {...cmdBtn}
                                                                aria-selected={routeWhere() == "SQL"}
                                                                onClick={() => setRouteWhere("SQL")}
                                                                >SQL Funcs</button>
                                                            <button {...cmdBtn}
                                                                aria-selected={routeWhere() == "ALIAS"}
                                                                onClick={() => setRouteWhere("ALIAS")}
                                                                >Aliases</button>
                                                            <button {...cmdBtn}
                                                                aria-selected={routeWhere() == "COLS"}
                                                                onClick={() => setRouteWhere("COLS")}
                                                                >Columns</button>
                                                        </div>
                                                        <div {...cmdSideList}>
                                                            <ul style={routeWhere() == "SQL" ? "" : "display:none"}>
                                                                <For each={"date(),time(),dateTime(),julianDay(),strFTime(),subStr(),trim(),lTrim(),rTrim(),length(),replace(),upper(),lower(),avg(),count(),max(),min(),sum(),group_concat(),".split(",")}>
                                                                    {func => <li {...cmdLi}>{func}</li>}
                                                                </For>
                                                            </ul>
                                                            <ul style={routeWhere() == "ALIAS" ? "" : "display:none"}>
                                                                <For each={Object.keys(props.toQuery.toAlias)}>
                                                                    {alias => <li {...cmdLi}>{alias}</li>}
                                                                </For>
                                                            </ul>
                                                            <ul style={routeWhere() == "COLS" ? "" : "display:none"}>
                                                                <For each={queryWindow.columns(props)}>
                                                                    {col => <li {...cmdLi}>{col}</li>}
                                                                </For>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>,
                                            aliasDefExpr: a => <>
                                                <div {...cmdBox}>
                                                    <div {...cmdMain}>
                                                        <div {...cmdGroup}>
                                                            <button disabled {...cmdBtn}
                                                                >Column</button>
                                                            <button {...cmdBtn}
                                                                aria-selected={true}
                                                                >Expression</button>
                                                            <button disabled {...cmdBtn}
                                                                >Form</button>
                                                        </div>
                                                        <div>
                                                            <textarea
                                                                value={a.def} 
                                                                class="w-full text-xs p-4 font-mono"
                                                                cols="30" 
                                                                rows="8" 
                                                                onChange={e => updateMacro.defExpr.set(val(e))} />
                                                        </div>
                                                    </div>
                                                    <div {...cmdSide}>
                                                        <div {...cmdGroup}>
                                                            <button {...cmdBtn}
                                                                aria-selected={routeWhere() == "SQL"}
                                                                onClick={() => setRouteWhere("SQL")}
                                                                >SQL Funcs</button>
                                                            <button {...cmdBtn}
                                                                aria-selected={routeWhere() == "ALIAS"}
                                                                onClick={() => setRouteWhere("ALIAS")}
                                                                >Aliases</button>
                                                            <button {...cmdBtn}
                                                                aria-selected={routeWhere() == "COLS"}
                                                                onClick={() => setRouteWhere("COLS")}
                                                                >Columns</button>
                                                        </div>
                                                        <div {...cmdSideList}>
                                                            <ul style={routeWhere() == "SQL" ? "" : "display:none"}>
                                                                <For each={"date(),time(),dateTime(),julianDay(),strFTime(),subStr(),trim(),lTrim(),rTrim(),length(),replace(),upper(),lower(),avg(),count(),max(),min(),sum(),group_concat(),".split(",")}>
                                                                    {func => <li {...cmdLi}>{func}</li>}
                                                                </For>
                                                            </ul>
                                                            <ul style={routeWhere() == "ALIAS" ? "" : "display:none"}>
                                                                <For each={Object.keys(props.toQuery.toAlias)}>
                                                                    {alias => <li {...cmdLi}>{alias}</li>}
                                                                </For>
                                                            </ul>
                                                            <ul style={routeWhere() == "COLS" ? "" : "display:none"}>
                                                                <For each={queryWindow.columns(props)}>
                                                                    {col => <li {...cmdLi}>{col}</li>}
                                                                </For>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        })(alias)(alias)}
                                    </Portal>
                                </Show>
                            </tr>
                        )}}
                    </For>
                    <tr>
                        <td colSpan={3}>
                            <input onClick={() => updateQueryEdit.alias.defCol({})} value="+ New" onFocus={e => e.currentTarget.blur()} />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        {unionCmd({
            cmdSelect: ()=><></>,
            cmdRaw: cmd => 
                <Portal mount={portalRaw.children[0]}>
                    <ViewTablesFloating {...props} />
                    <div {...cmdBox}>
                        <div {...cmdMain}>
                            <div {...cmdGroup}>
                                <button {...cmdBtn}
                                    aria-selected={true}
                                    >Query</button>
                            </div>
                            <div>
                                <textarea 
                                    class="w-full text-xs p-4 font-mono"
                                    onChange={e => updateQueryEdit.cmd.raw.expression(val(e))} 
                                    value={cmd.raw} 
                                    cols="30" 
                                    rows="8" 
                                />
                            </div>
                        </div>
                        <div {...cmdSide}>
                            <div {...cmdGroup}>
                                <button {...cmdBtn}
                                    aria-selected={routeRaw() == "SQL"}
                                    onClick={() => setRouteRaw("SQL")}
                                    >SQL Funcs</button>
                                <button {...cmdBtn}
                                    aria-selected={routeRaw() == "ALIAS"}
                                    onClick={() => setRouteRaw("ALIAS")}
                                    >Aliases</button>
                                <button {...cmdBtn}
                                    aria-selected={routeRaw() == "COLS"}
                                    onClick={() => setRouteRaw("COLS")}
                                    >Columns</button>
                            </div>
                            <div {...cmdSideList}>
                                <ul style={routeRaw() == "SQL" ? "" : "display:none"}>
                                    <For each={"date(),time(),dateTime(),julianDay(),strFTime(),subStr(),trim(),lTrim(),rTrim(),length(),replace(),upper(),lower(),avg(),count(),max(),min(),sum(),group_concat(),".split(",")}>
                                        {func => <li {...cmdLi}>{func}</li>}
                                    </For>
                                </ul>
                                <ul style={routeRaw() == "ALIAS" ? "" : "display:none"}>
                                    <For each={Object.keys(props.toQuery.toAlias)}>
                                        {alias => <li {...cmdLi}>{alias}</li>}
                                    </For>
                                </ul>
                                <ul style={routeRaw() == "COLS" ? "" : "display:none"}>
                                    <For each={queryWindow.columns(props)}>
                                        {col => <li {...cmdLi}>{col}</li>}
                                    </For>
                                </ul>
                            </div>
                        </div>
                    </div>
                </Portal>,
            cmdWhere: cmd=>
                <Portal mount={portalWhere.children[0]}>
                    <ViewTablesFloating {...props} />
                    <div {...cmdBox}>
                        <div {...cmdMain}>
                            <div {...cmdGroup}>
                                <button {...cmdBtn}
                                    aria-selected={true}
                                    >Condition</button>
                            </div>
                            <div>
                                <textarea 
                                    class="w-full text-xs p-4 font-mono"
                                    onChange={e => updateQueryEdit.cmd.where.condition(val(e))} 
                                    value={cmd.condition} 
                                    cols="30" 
                                    rows="8" 
                                />
                            </div>
                        </div>
                        <div {...cmdSide}>
                            <div {...cmdGroup}>
                                <button {...cmdBtn}
                                    aria-selected={routeWhere() == "SQL"}
                                    onClick={() => setRouteWhere("SQL")}
                                    >SQL Funcs</button>
                                <button {...cmdBtn}
                                    aria-selected={routeWhere() == "ALIAS"}
                                    onClick={() => setRouteWhere("ALIAS")}
                                    >Aliases</button>
                                <button {...cmdBtn}
                                    aria-selected={routeWhere() == "COLS"}
                                    onClick={() => setRouteWhere("COLS")}
                                    >Columns</button>
                            </div>
                            <div {...cmdSideList}>
                                <ul style={routeWhere() == "SQL" ? "" : "display:none"}>
                                    <For each={"date(),time(),dateTime(),julianDay(),strFTime(),subStr(),trim(),lTrim(),rTrim(),length(),replace(),upper(),lower(),avg(),count(),max(),min(),sum(),group_concat(),".split(",")}>
                                        {func => <li {...cmdLi}>{func}</li>}
                                    </For>
                                </ul>
                                <ul style={routeWhere() == "ALIAS" ? "" : "display:none"}>
                                    <For each={Object.keys(props.toQuery.toAlias)}>
                                        {alias => <li {...cmdLi}>{alias}</li>}
                                    </For>
                                </ul>
                                <ul style={routeWhere() == "COLS" ? "" : "display:none"}>
                                    <For each={queryWindow.columns(props)}>
                                        {col => <li {...cmdLi}>{col}</li>}
                                    </For>
                                </ul>
                            </div>
                        </div>
                    </div>
                </Portal>
        })(props.toQuery.anyCmd)(props.toQuery.anyCmd)}

        <Portal mount={portalFrom.children[0]}>
            <ViewTablesFloating {...props} />
            {unionCmd({
                    cmdWhere: cmd => {},
                    cmdSelect: cmd => {},
                    cmdRaw: cmd => <>
                        <div>
                            
                            <div {...tabGroup}>
                                <button {...tabBtn} 
                                    aria-selected={true}
                                    >Include</button>
                            </div>
                            <For each={props.toQuery.toJoin}>
                                {(q, i) => (
                                    <div>
                                        <select 
                                            class="p-4 text-xs w-full font-mono"
                                            value={q.to} 
                                            onChange={e => updateQueryEdit.join.reTable({ i: i(), ...val(e) })}>
                                            <TableList />
                                        </select>
                                    </div>
                                )}
                            </For>
                            <button 
                                class="p-4 bg-emerald-200 text-xs w-full font-mono"
                                onClick={() => updateQueryEdit.join.new({})}
                                >Add a table</button>
                        </div>
                    </>,
            })(props.toQuery.anyCmd)(props.toQuery.anyCmd) 
            ||
            <div>
                <EditFromJoin {...props} updateQueryEdit={updateQueryEdit} />
            </div> 
            }
        </Portal>

        <div {...portal}><div></div></div>
    </div>
)}, QueryId, TDC.ToQueries, TDC.ToQuery, Limit, SetLimit, SetIgnoreLimit);