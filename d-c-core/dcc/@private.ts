import { fn } from "@hwyblvd/st"
import { OutAlias, ToAlias, ToFunc, ToQueries, ToQuery, unionAlias, unionFrom } from "./@types"

const

parseReferences = fn(props => {

    unionFrom({
        fromRaw: from => {},
        fromUse: from => (
            parseReferences({ ...props, toQuery: props.toQueries[from.use] }),
            props.outRefs.add(from.use)
        )
    })(props.toQuery.anyFrom)(props.toQuery.anyFrom)

    for (const { to } of props.toQuery.toJoin) 
        parseReferences({ ...props, toQuery: props.toQueries[to] }),
        props.outRefs.add(to)
    
}, { outRefs: new Set }, ToQuery, ToQueries)

export const 

parseAlias = fn(props => 
    Object.entries(props.outAlias).reduce((def, [name, aliasDef]) => def.replaceAll(name, `(${aliasDef})`), props.def)
, { def: "" }, OutAlias),

parseMacro = fn(props => {
    const outAlias = {} as Record<string, string>
    // const aliasColumns = [] as string[]
    for (const [aliasName, alias] of Object.entries(props.toAlias)) {
        let { def } = unionAlias({
            aliasCall: a => props.toFunc[a.call],
            aliasDefCol: a => a,
            aliasDefExpr: a => a
        })(alias)(alias)
        unionAlias({
            aliasDefCol: a => 
                def = parseAlias({ def, outAlias })
            ,
            aliasDefExpr: a => 
                def = parseAlias({ def, outAlias })
            ,
            aliasCall: a => {
                for (const [paramName, param] of Object.entries(a.params)) 
                    def = def.replaceAll(paramName, parseAlias({ def: param, outAlias }))
            }
        })(alias)(alias)
        outAlias[aliasName] = def
    }
    return { outAlias }
}, ToAlias, ToFunc),

pruneUnusedQueries = fn(props => {
    const outRefs = new Set
    parseReferences({ ...props, outRefs })
    const toQueries: typeof props.toQueries = {}
    // @ts-ignore
    outRefs.forEach(x => props.toQueries[x] && (toQueries[x] = props.toQueries[x]))
    return { toQueries }
}, ToQueries, ToQuery)