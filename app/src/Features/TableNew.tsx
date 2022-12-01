import { fn } from "@hwyblvd/st"
import { batch, createRoot, For, Show } from "solid-js"
import { createStore } from "solid-js/store"
import { C, setStore, store } from "../Context"
import { SqlNew } from "../CtxSql"
import { Style, useRef } from "../xlib/Ref"

// #region Context 

export const [newTable, setNewTable] = createStore({
    queryCommand: "select" as "select" | "where" | "raw",
    tableFrom: null as any as C,
    tablesJoin: [] as C["sqlFrom"],
    tableAlias: "NewQuery",
    showModal: false
})

export const updateNewTable = {
    setFrom: (tbl: C) => setNewTable("tableFrom", tbl),
    setCommand: (cmd: string) => setNewTable("queryCommand", cmd as any),
    setAlias: (alias: string) => setNewTable("tableAlias", alias),
    add: () => setNewTable("tablesJoin", newTable.tablesJoin.length, // @ts-ignore
        { join: "INNER", sqlAlias: null, sqlValue: null }),
    changeJoin: (i: number, join: string) => setNewTable("tablesJoin", i, "join", join as any),
    changeTable: (i: number, tbl: C) => batch(() => {
        setNewTable("tablesJoin", i, "sqlAlias", tbl.sqlAlias)
        setNewTable("tablesJoin", i, "sqlWith", tbl.sqlWith)
    }),
    changeValue: (i: number, value: string) => setNewTable("tablesJoin", i, "sqlValue", value),
    confirm: () => {
        const command = newTable.queryCommand
        setStore("all", store.all.length, {
            windowKey: { visible: true },
            // @ts-ignore
            query: (
                command == "raw" ? SqlNew.raw(newTable.tableAlias, "SELECT 1") :
                command == "select" ? SqlNew.select(newTable.tableAlias, "*", [
                    SqlNew.from(newTable.tableFrom),
                    ...newTable.tablesJoin
                ]) :
                command == "where" ? SqlNew.where(newTable.tableAlias, "1", [
                    SqlNew.from(newTable.tableFrom),
                    ...newTable.tablesJoin
                ]) :
                (() => { throw new Error(`Unknown command ${command}`) })()
            )
                
        })
        updateNewTable.cancel()
    },
    cancel: () => {
        setNewTable("showModal", false) 
        // @ts-ignore
        setNewTable({ tableFrom: null, tablesJoin: [], tableAlias: "NewQuery" })
    }
}

// #endregion

// #region CSS

const [aside, section, spaceBetween, spaceCenter] = useRef();

createRoot(() => <> 
    <Style {...aside}
        position={"fixed"}
        width={"100vw"}
        height={"100vh"}
        font-size={"1.2em"}
        background={"#eee6"}
        backdrop-filter={"blur(4px)"}
        // -webkit-backdrop-filter={"blur(4px)"}
        display={"grid"}
        z-index={10}
    />
    <Style {...section}
        margin={"auto"}
        width={"20em"}
        height={"30em"}
        padding={"1em"}
        border-radius={"1em"}
        background={"white"}
    />
    <Style {...spaceBetween} 
        display={"flex"}
        justify-content={"space-between"}
    />
    <Style {...spaceCenter} 
        display={"flex"}
        justify-content={"center"}
    />
</>);

// #endregion

export const NewTable = fn(props => {
    return (
        <aside {...aside}>
            <section {...section}>
                <nav>
                    <div {...spaceBetween}>
                        <b>Query Command</b>
                        <select onChange={e => updateNewTable.setCommand(e.currentTarget.value)}>
                            <option textContent="Select" value="select" />
                            <option textContent="Where" value="where" />
                            <option textContent="RAW" value="raw" />
                        </select>
                    </div>
                    <br /><hr /><br />
                    <Show when={newTable.queryCommand != "raw"}>
                        <div {...spaceBetween}>
                            <b>From</b>
                            <select onChange={e => updateNewTable.setFrom(store.all[Number(e.currentTarget.value)].query)}>
                                <option value="">Pick a table</option>
                                <For each={store.all}>
                                    {(x, i) => (
                                        <option value={i()}>
                                            <b>{x.query.sqlAlias}</b> <small>{x.query.sqlCommand.toUpperCase()}</small>
                                        </option>
                                    )}
                                </For>
                            </select>
                        </div>
                        <br /><hr /><br />
                        <div>
                            <b>Joins</b> <br />
                            <For each={newTable.tablesJoin}>
                                {(q, i) => (
                                    <div>
                                        <select value={q.join} onChange={e => updateNewTable.changeJoin(i(), e.currentTarget.value)}>
                                            <option textContent="INNER" />
                                            <option textContent="LEFT" />
                                        </select>
                                        JOIN 
                                        <select onChange={e => updateNewTable.changeTable(i(), store.all[Number(e.currentTarget.value)].query)}>
                                            <option value="-1">Pick a table</option>
                                            <For each={store.all}>
                                                {(x, i) => (
                                                    <option value={i()}>
                                                        <b>{x.query.sqlAlias}</b> <small>{x.query.sqlCommand}</small>
                                                    </option>
                                                )}
                                            </For>
                                        </select>
                                        ON <textarea onChange={e => updateNewTable.changeValue(i(), e.currentTarget.value)} cols="20" rows="4"></textarea>
                                    </div>
                                )}
                            </For>
                            <button onClick={updateNewTable.add}>Add a table</button>
                        </div>
                        <br /><hr /><br />
                    </Show>
                    <div {...spaceBetween}>
                        <b>Name</b>
                        <small>
                            <input value={newTable.tableAlias} onChange={e => updateNewTable.setAlias(e.currentTarget.value)} />
                        </small>
                    </div>
                    <br /><hr /><br />
                    <div {...spaceCenter}>
                        <button onClick={updateNewTable.confirm}>Done</button>
                        <button onClick={updateNewTable.cancel}>Cancel</button>
                    </div>
                </nav>
            </section>
        </aside>
    )
})