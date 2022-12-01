import { declareProps, fn, MCast } from "@hwyblvd/st";
import { ConnectionString, RawQueryString } from "./-props.js";
import { Connect } from "./db-connect.js";

/** @type {Awaited<ReturnType<typeof Connect["MSSQL"]>>["queryFunction"]} */
export let activeConnection;
/** @type {keyof typeof Connect} */
export let dbProvider;

export const DbProps = declareProps({
    /** @ts-ignore @type {keyof typeof Connect} */
    database: MCast("", { type: "string" })
})

export const

dbConnect = fn(async props => {
    activeConnection = (await Connect[props.database](props)).queryFunction;
    dbProvider = props.database;
}, DbProps.Database, ConnectionString),

dbQuery = fn(async props => 
    activeConnection(props)
, RawQueryString),

dbIsConnected = fn(async () => ({ dbProvider })),

dbDisconnect = fn(async props => {
    // @ts-ignore
    activeConnection = undefined;
    // @ts-ignore
    dbProvider = undefined;
})

;
