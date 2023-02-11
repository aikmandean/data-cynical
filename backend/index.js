import { createAllRoutes, createFastifyBase } from "@hwyblvd/server";
import { fn } from "@hwyblvd/st";
import { findFreePorts } from "find-free-ports";
import { fastifyStatic } from "@fastify/static";
import { fastifyHttpProxy } from "@fastify/http-proxy";
import OU from "openurl";
import { join } from "path";
import { exec } from "child_process";
import * as APIs from "./api/v1.js";

import "./api/helpers/-onstartup.js";

const 

dirMode = fn(() => {
    try {
        return __dirname
    } catch { }
}),

frontendDevServer = fn(async props => {

    console.log("Loading frontend dev server")

    exec(`cd frontend/app && npx -y vite --host ${props.host} --port ${props.portFrontend}`); 
    // .stdout?.addListener("data", console.log);

    await new Promise(r => setTimeout(r, 800))

    props.fastify.register(fastifyHttpProxy, {
        upstream: `http://${props.host}:${props.portFrontend}/`,
        prefix: "/",
        httpMethods: ["GET"]
    });
    
}, createAllRoutes, createFastifyBase, { portFrontend: 0 }),

setup = fn(async props => {
    const [, portFrontend, portApi] = await findFreePorts(3, { startPort: 10_000 });

    props.port = portApi;

    for (const route in APIs) // @ts-ignore
        if(typeof APIs[route] == "function") // @ts-ignore
            props.routes.push({ url: `/api/v1/${route}`, handler: APIs[route] });
    
    if(dirMode())
        props.fastify.register(fastifyStatic, { root: join(__dirname, "views") });
    else 
        await frontendDevServer({ ...props, portFrontend });

    createAllRoutes(props);
    createFastifyBase(props);
    OU.open(`http://${props.host}:${props.port}`);

}, createAllRoutes, createFastifyBase);

// @ts-ignore
setup({});