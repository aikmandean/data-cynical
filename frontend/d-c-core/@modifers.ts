import Internals, { fn } from "@hwyblvd/st"

type UTI<T> = Internals.Util.UnionToIntersection<T>
type Name<N> = Internals.Metadata.New<typeof Internals.Declare.SFuncname, N>

export const 

MSwitch: 
<GTypes>
    (t:GTypes) => 
        <GFuncs extends {[K in keyof GTypes]: (m: GTypes[K]) => unknown}>
            (u:GFuncs) => 
                <GKey extends keyof GTypes>
                (props: { is: GKey }) =>
                    (m: GTypes[GKey]) => ReturnType<GFuncs[GKey]>
// @ts-ignore
= choices => handlers => kind => handlers[kind.is],

MHas = <T extends {}[]>(...t: T) => fn(()=>{}, ...t),

MMix = <T extends {}[], U = UTI<T[number]>>(...t: T) => ({} as {[K in keyof U]: U[K]}[keyof U]),

/**
 * @example
 * ```js
 * const { ErrNameTooLong } = declareErrors({
 *   errNameTooLong: [MHas(FirstName, LastName), {}]
 * })
 * ```
 */
declareErrors: 
<T extends Record<string,[any,any]>>
    (t:T) => 
        UTI<{[K in keyof T]: { [UK in Capitalize<Extract<K,string>>]:
            T[K] extends [infer F, infer T] ? 
            F extends (p: infer P) => any ? 
                Name<K> & P & { [K1 in K]: ((p: { 
                    props: P,
                    info: T,
                    name: K extends `err${infer N}` ? N : string
                }) => ({})) }
            : never : never 
        } }[keyof T]>
// @ts-ignore
= errors => Object.fromEntries(Object.entries(errors).map(x => [x[0],{}]))