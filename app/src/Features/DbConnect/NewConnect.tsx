import { fn } from "@hwyblvd/st";
import { Show } from "solid-js";
import { storeDb, val } from "../../Context";
import { Tw } from "../../xlib/Ref";
import { updateConn } from "./@context";

// #region private
const 

Internal = fn(props => <>
    <Tw class="fixed grid w-screen h-screen z-10" />
    <Tw class="backdrop-filter backdrop-blur-sm bg-slate-200 bg-opacity-60" />
    <aside>
        <Tw class="m-auto w-96 h-96 pt-8 p-4" />
        <Tw class="bg-white" />
        <section>
            <nav>
                <div class="flex justify-between">
                    <b>Database</b>
                    <select onChange={e => updateConn.setDatabase(val(e))}>
                        <option textContent="SQLite 3" value="SQLITE" />
                        <option textContent="PostgreSQL" value="POSTGRESQL" />
                        <option textContent="MySQL" value="MYSQL" />
                        <option textContent="- MS SQL" value="MSSQL" />
                        <option textContent="- MS Access (mdb)" value="ACCESS" />
                    </select>
                </div>
                <br /><hr /><br />
                <div>
                    <b>Connection String</b> <br />
                    <input 
                        class="w-full bg-slate-300 rounded-none"
                        onChange={e => updateConn.setConnectionString(val(e))} />
                </div>
                <br /><hr /><br />
                <div class="flex justify-center">
                    <Tw class="bg-emerald-300 py-1 px-4" />
                    <Tw class="hover:bg-emerald-200" />
                    <button onClick={updateConn.connect}>Connect</button>
                </div>
            </nav>
        </section>
    </aside>
</>);
// #endregion

export const 

NewConnect = fn(props => 
    <Show when={storeDb.showModal}>
        <Internal {...props} />
    </Show>
, Internal);