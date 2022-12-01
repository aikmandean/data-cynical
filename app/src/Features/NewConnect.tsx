import { fn } from "@hwyblvd/st";
import { createRoot } from "solid-js";
import { createStore } from "solid-js/store";
import { API, APIProps } from "../Url";
import { Style, useRef } from "../xlib/Ref";

// #region Context

export const [newConn, setNewConnect] = createStore({
	uDatabase: "SQLITE" as APIProps["dbConnect"]["database"],
	uConnectionString: null as any as APIProps["dbConnect"]["connectionString"],
    showModal: true
});

export const updateConn = {
    detectConnectionStatus: async () => {
        const { dbProvider } = await API.dbIsConnected({});
        if(!dbProvider) return;

        if(!newConn.uConnectionString)
            setNewConnect("uConnectionString", "<Private>");

        setNewConnect("uDatabase", dbProvider);
        setNewConnect("showModal", false)
    },
    setDatabase: (type: any) => setNewConnect("uDatabase", type),
    setConnectionString: (string: any) => setNewConnect("uConnectionString", string),
    connect: async () => {
        await API.dbConnect({
            database: newConn.uDatabase,
            connectionString: newConn.uConnectionString
        });
        await updateConn.detectConnectionStatus();
    },
    disconnect: async () => {
        await API.dbDisconnect({});
        setNewConnect("uConnectionString", "");
        setNewConnect("showModal", true);
    }
};

await updateConn.detectConnectionStatus();

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

export const NewConnect = fn(props => {
    return (
        <aside {...aside}>
            <section {...section}>
                <nav>
                    <div {...spaceBetween}>
                        <b>Database</b>
                        <select onChange={e => updateConn.setDatabase(e.currentTarget.value)}>
                            <option textContent="SQLite 3" value="SQLITE" />
                            <option textContent="MS SQL" value="MSSQL" />
                            <option textContent="PostgreSQL" value="POSTGRESQL" />
                            <option textContent="MySQL" value="MYSQL" />
                            <option textContent="MS Access (mdb)" value="ACCESS" />
                        </select>
                    </div>
                    <br /><hr /><br />
                    <div>
                        <b>Connection String</b> <br />
                        <input onChange={e => updateConn.setConnectionString(e.currentTarget.value)} />
                    </div>
                    <br /><hr /><br />
                    <div {...spaceCenter}>
                        <button onClick={updateConn.connect}>Connect</button>
                    </div>
                </nav>
            </section>
        </aside>
    );
});