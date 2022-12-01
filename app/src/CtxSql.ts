import { declareProps, MOptional } from "@hwyblvd/st"

const $queryRaw = String.raw

export const { SqlAlias, SqlValue, SqlWith } = declareProps({
    sqlAlias: "",
    sqlValue: "",
    sqlWith: MOptional({})
})

type HasSqlPair = {
    sqlAlias: string
    sqlValue: string
}
type HasSqlWith = {
    sqlWith: { [sqlAlias: string]: { value: string } }
}
type HasSqlFrom = {
    sqlFrom: ({ join: "INNER" | "LEFT" } & HasSqlPair & HasSqlWith)[]
}
export type CWhere = {
    sqlCommand: "where"
} & HasSqlPair & HasSqlFrom & HasSqlWith
export type CSelect = {
    sqlCommand: "select"
} & HasSqlPair & HasSqlFrom & HasSqlWith
export type CRaw = {
    sqlCommand: "raw"
} & HasSqlPair & HasSqlFrom & HasSqlWith

export const SqlNew = {
    where(sqlAlias: string, sqlValue: string, sqlFrom: HasSqlFrom["sqlFrom"]) {
        const cmd: CWhere = {
            sqlCommand: "where",
            sqlAlias, sqlValue, sqlFrom, sqlWith: {}
        }
        mergeWithQueries(sqlFrom, SqlRender.where(cmd), cmd)
        return cmd
    },
    select(sqlAlias: string, sqlValue: string, sqlFrom: HasSqlFrom["sqlFrom"]) {
        const cmd: CSelect = {
            sqlCommand: "select",
            sqlAlias, sqlValue, sqlFrom, sqlWith: {},
        }
        mergeWithQueries(sqlFrom, SqlRender.select(cmd), cmd)
        return cmd
    },
    raw(sqlAlias: string, sqlValue: string, sqlFrom?: HasSqlFrom["sqlFrom"]) {
        const cmd: CRaw = {
            sqlCommand: "raw",
            sqlAlias, sqlValue, 
            sqlFrom: sqlFrom as HasSqlFrom["sqlFrom"], 
            sqlWith: {},
        }
        mergeWithQueries(sqlFrom || [], SqlRender.raw(cmd), cmd)
        return cmd
    },
    from(aliasable: HasSqlPair & HasSqlWith, sqlValue?: string, join: "INNER"|"LEFT" = "INNER") {
        return {
            sqlAlias: aliasable.sqlAlias,
            sqlValue: sqlValue as string,
            join,
            sqlWith: aliasable.sqlWith
        }
    }
}

export const SqlRender = {
    from(hasFrom: HasSqlFrom) {
        const parts = [] as string[]
        for (let i = 0; i < hasFrom.sqlFrom.length; i++) {
            const fr = hasFrom.sqlFrom[i]
            
            parts.push(
                i 
                ? `${fr.join} JOIN ${fr.sqlAlias} ON ${fr.sqlValue}`
                : `FROM ${fr.sqlAlias}`
            )
            
        }
        return parts.join("\n")
    },
    where(input: CWhere) {
        return { [input.sqlAlias]: { value: $queryRaw`
            SELECT *
            ${SqlRender.from(input)}
            WHERE ${input.sqlValue}
        ` } }
    },
    select(input: CSelect) {
        return { [input.sqlAlias]: { value: $queryRaw`
            SELECT ${input.sqlValue}
            ${SqlRender.from(input)}
        ` } }
    },
    raw(input: CRaw) {
        return { [input.sqlAlias]: { value: input.sqlValue } }
    }
}

function mergeWithQueries(subqueries: HasSqlFrom["sqlFrom"], last: HasSqlWith["sqlWith"], cmd: HasSqlWith) {
    const sqlWith = { ...last }
    for (const q of subqueries) 
        Object.assign(sqlWith, q.sqlWith)
    return Object.assign(cmd.sqlWith, sqlWith)
}

export function transcribeQuery(cmd: HasSqlPair & HasSqlFrom & HasSqlWith) {
    const subQueries = { ...cmd.sqlWith }
    const query = subQueries[cmd.sqlAlias]
    delete subQueries[cmd.sqlAlias]
    
    const withQueries = Object.entries(subQueries)
    
    if(!withQueries.length)
        return query.value
    else
        return `
            WITH 
                ${Object.entries(subQueries).map(([alias, query]) => 
                    `${alias} AS (${query.value})`)}
            ${query.value}
        `
}
