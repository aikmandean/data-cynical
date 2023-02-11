import { fn } from "@hwyblvd/st"
import { AnyCmd, AnyFrom, OutAlias, ToAlias, ToFunc, ToJoin, ToQueries, ToQuery, unionCmd, unionFrom } from "./@types"
import { parseAlias, parseMacro, pruneUnusedQueries } from "./@private"

export * as TDC from "./@types"

const 

renderFrom = fn(props => 
    unionFrom({
        fromRaw: from => `\nFROM ${from.raw}`,
        fromUse: from => `\nFROM ${from.use}`
    })(props.anyFrom)(props.anyFrom)
, AnyFrom),

renderColumns = fn(props => 
   Object.entries(props.outAlias).map(([name, aliasDef]) => `(${aliasDef}) AS ${name}`).join(",\n\t") || "*"
, OutAlias),

renderWhere = fn(props => 
    `\nWHERE ${parseAlias({ ...props, def: props.condition })}`
, { condition: "" }, OutAlias),

renderJoin = fn(props => 
    !props.toJoin.length ? "" :
        props.toJoin.map(({on,to,type}) => `\n${parseAlias({def: type, ...props})} JOIN ${parseAlias({def: to, ...props})} ON\n\t${parseAlias({def: on, ...props})}`).join("")
, OutAlias, ToJoin)

export const 

renderQuerySingle = fn(props => {
    const { outAlias } = parseMacro(props)
    return unionCmd({
        cmdSelect: () => 
            `SELECT ${renderColumns({ outAlias })}${renderFrom(props)}${renderJoin({...props, outAlias})}`
        ,
        cmdWhere: cmd => 
            `SELECT ${renderColumns({ outAlias })}${renderFrom(props)}${renderJoin({...props, outAlias})}${renderWhere({ ...cmd, outAlias })}`
        ,
        cmdRaw: cmd => 
            parseAlias({ def: cmd.raw, outAlias })
        ,
    })(props.anyCmd)(props.anyCmd)
}, AnyCmd, AnyFrom, ToAlias, ToFunc, ToJoin),

renderQueryComplete = fn(props => {
    const { toQueries } = pruneUnusedQueries(props)
    const queries = Object.entries(toQueries)
    return (
        (!queries.length ? "" : (
            "WITH" +
            queries.map(([name, query]) => 
                `\n\t${name} AS (\n\t\t${renderQuerySingle(query).replaceAll("\n","\n\t\t")}\n\t)`
            ).join(",") +
            "\n"
        )) +
        renderQuerySingle(props.toQuery)
    )
}, ToQuery, ToQueries)