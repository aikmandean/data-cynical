import { fn } from "@hwyblvd/st";
import { setStoreDb, storeDb } from "../../Context";
import { API } from "../../Url";

export const 

updateConn = {
    detectConnectionStatus: async () => {
        const { dbProvider } = await API.dbIsConnected({});
        if(!dbProvider) return;

        if(!storeDb.uConnectionString)
            setStoreDb("uConnectionString", "<Private>");

        setStoreDb("uDatabase", dbProvider);
        setStoreDb("showModal", false)
    },
    setDatabase: fn(props => setStoreDb("uDatabase", props.value), { value: "" as typeof storeDb.uDatabase }),
    setConnectionString: fn(props => setStoreDb("uConnectionString", props.value), { value: "" }),
    connect: async () => {
        await API.dbConnect({
            database: storeDb.uDatabase,
            connectionString: storeDb.uConnectionString
        });
        await updateConn.detectConnectionStatus();
        location.reload();
    },
    disconnect: async () => {
        await API.dbDisconnect({});
        setStoreDb("uConnectionString", "");
        setStoreDb("showModal", true);
    }
},

queryConn = {
    listDbTables() {
        const queries: Record<typeof storeDb["uDatabase"], string> = {
            SQLITE: `SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`,
            POSTGRESQL: `SELECT table_name AS name FROM information_schema.tables WHERE table_schema='public'`,
            ACCESS: `SELECT name FROM MSysObjects WHERE type IN (1,4,6) AND name NOT LIKE '~*' AND name NOT LIKE 'MSys*'`,
            MSSQL: `SELECT table_name AS name FROM information_schema.tables WHERE table_type='BASE TABLE' AND table_catalog='dbName'`,
            MYSQL: `SELECT table_name AS name FROM information_schema.tables WHERE table_type='BASE TABLE' AND table_schema='dbName'`
        }
        return queries[storeDb.uDatabase]
    }
};

await updateConn.detectConnectionStatus();