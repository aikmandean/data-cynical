import SQLITE from "better-sqlite3";
import MSSQL from "mssql";
import ACCESS from "mdb-reader";
import _pg_ from "pg";
const { Client: POSTGRESQL } = _pg_;
import MYSQL from "mysql";
import * as fs from "fs"
import { IConnect } from "./-interfaces.js";

export const Connect = {
    SQLITE: IConnect.onConnect({
        connectFunction: async props => {
            const internalConnection = SQLITE(props.connectionString, { readonly: true });
            
            return {
                queryFunction: async props => 
                    internalConnection.prepare(props.rawQueryString).all()
            }
        }
    }),
    MSSQL: IConnect.onConnect({
        connectFunction: async props => {
            await MSSQL.connect(props.connectionString);
        
            return {
                queryFunction: async props => 
                    (await MSSQL.query(props.rawQueryString)).recordset
            }
        }
    }), 
    MYSQL: IConnect.onConnect({
        connectFunction: async props => {
            const internalConnection = MYSQL.createConnection(props.connectionString);
        
            internalConnection.connect();
        
            return {
                queryFunction: props => {
                    /** @type {(v:any)=>void} */
                    let promiseResolve;
                    /** @type {(v:any)=>void} */
                    let promiseReject;
                    const promise = new Promise((res, rej) => {
                        promiseResolve = res;
                        promiseReject = rej;
                    });
                    internalConnection.query(props.rawQueryString, (error, results, fields) => 
                        error 
                            ? promiseReject(error) 
                            : promiseResolve(results)
                    );
                    return promise;
                }
            }
        }
    }),
    ACCESS: IConnect.onConnect({
        connectFunction: async props => {
            const internalConnection = new ACCESS(fs.readFileSync(props.connectionString));
            
            return {
                queryFunction: async props => {
                    throw new Error(`Query raw not implemented.`);
                    /** @ts-ignore */
                    return internalConnection.query(props.rawQueryString);
                }
            }
        }
    }),
    POSTGRESQL: IConnect.onConnect({
        connectFunction: async props => {
            const internalConnection = new POSTGRESQL(props.connectionString);
            await internalConnection.connect();
            return {
                queryFunction: async props => 
                    (await internalConnection.query(props.rawQueryString)).rows
            }
        }
    }) 
}
