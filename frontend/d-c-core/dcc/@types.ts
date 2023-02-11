import { declareProps } from "@hwyblvd/st"
import { MSwitch, MMix, MHas } from "../@modifers"

const


{ AliasCall, AliasDefCol, AliasDefExpr } = declareProps({
    // inFunc: { def: "", params: {} as Record<string, object> },
    /** This Def variant contains a macro-enabled SQL expression. */
    aliasDefCol: { is: "aliasDefCol" as const, def: "" },
    aliasDefExpr: { is: "aliasDefExpr" as const, def: "" },
    /** This Call variant is a full invocation of a Macro.Func */
    aliasCall: { is: "aliasCall" as const, call: "", params: {} as Record<string, string> }
}),

{ FromRaw, FromUse } = declareProps({
    fromUse: { is: "fromUse" as const, use: "" },
    fromRaw: { is: "fromRaw" as const, raw: "" }
}),

{ JoinAny } = declareProps({
    joinAny: { to: "", on: "", type: "" as "INNER" | "LEFT" | "OUTER" | "CROSS" }
}),

{ CmdRaw, CmdSelect, CmdWhere } = declareProps({
    cmdSelect: { is: "cmdSelect" as const },
    cmdRaw: { is: "cmdRaw" as const, raw: "" },
    cmdWhere: { is: "cmdWhere" as const, condition: "" }
})

export const 

{ AnyAlias, AnyCmd, AnyFrom } = declareProps({
    anyAlias: MMix(AliasCall, AliasDefCol, AliasDefExpr),
    anyFrom: MMix(FromRaw, FromUse),
    anyCmd: MMix(CmdRaw, CmdSelect, CmdWhere),
}),

{ 
    ToAlias, 
    ToFunc,
    ToJoin,
    ToReferences,
} = declareProps({
    toAlias: {} as Record<string, typeof AnyAlias["anyAlias"]>,
    toFunc: {} as Record<string, { def: string, params: Record<string, string> }>,
    toJoin: [] as typeof JoinAny["joinAny"][],
    toReferences: {} as Record<string, string[]>,
}),

unionAlias = MSwitch({
    ...AliasDefCol,
    ...AliasDefExpr,
    ...AliasCall,
}),

unionFrom = MSwitch({
    ...FromRaw,
    ...FromUse
}),

unionCmd = MSwitch({
    ...CmdRaw,
    ...CmdSelect,
    ...CmdWhere
}),

canQuery = MHas(AnyCmd, AnyFrom, ToAlias, ToFunc, ToJoin),

{ OutAlias, ToQuery } = declareProps({
    outAlias: {} as Record<string, string>,
    toQuery: {} as ((typeof canQuery) extends (p: infer P) => any ? P : never)
}),

{ ToQueries } = declareProps({
    toQueries: {} as Record<string, typeof ToQuery["toQuery"]>
})