import type * as TAPI from "../../api/v1";

export const apiRoot = "http://localhost:8080/api";
export const apiBasic = apiRoot + "/v1";

export async function fetchJson(url = "", body = {}, options = {}) {
    return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        ...options
    }).then(r => r.json());
} ;


type Props<F> = F extends (props: infer P) => any ? P : never;

export type APIProps = {[K in keyof typeof TAPI]: Props<typeof TAPI[K]> };

// @ts-ignore
export const API: typeof TAPI = new Proxy({}, {
	get: (_, p: string) => (props: any) => fetchJson(apiBasic + "/" + p, props)
});