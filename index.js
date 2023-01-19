import { discoverApiDefinitions, enableSwagger } from "@hwyblvd/swagger";
import { addFileRoutes, createAllRoutes, createFastifyBase } from "@hwyblvd/server";
import { createServingProxy } from "@hwyblvd/proxy";
import { fn } from "@hwyblvd/st";
import { metaDir } from "@hwyblvd/cli";

import "./api/helpers/-onstartup.js";

const setup = fn(async props => {
    await addFileRoutes(props)
    createServingProxy({
        ...props,
        upstreamUrl: "http://127.0.0.1:7575/",
        proxyEndpoint: "/"
    });
    enableSwagger(props)
    discoverApiDefinitions(props);
    createFastifyBase(props);
    createAllRoutes(props);
}, enableSwagger, discoverApiDefinitions, addFileRoutes, createAllRoutes, createFastifyBase);

setup({
    path: "api",
    routes: [],
    port: 7474,
    host: "127.0.0.1",
    baseUrl: "http://localhost:7474",
    parent: metaDir(import.meta)
});
