"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSdk = exports.PoolsDocument = exports.getBuiltGraphSDK = exports.subscribe = exports.execute = exports.getBuiltGraphClient = exports.createBuiltMeshHTTPHandler = exports.getMeshOptions = exports.rawServeConfig = void 0;
const utils_1 = require("@graphql-mesh/utils");
const utils_2 = require("@graphql-mesh/utils");
const utils_3 = require("@graphql-mesh/utils");
const cache_localforage_1 = require("@graphql-mesh/cache-localforage");
const fetch_1 = require("@whatwg-node/fetch");
const graphql_1 = require("@graphql-mesh/graphql");
const graphql_2 = require("graphql");
const merger_bare_1 = require("@graphql-mesh/merger-bare");
const utils_4 = require("@graphql-mesh/utils");
const http_1 = require("@graphql-mesh/http");
const runtime_1 = require("@graphql-mesh/runtime");
const store_1 = require("@graphql-mesh/store");
const cross_helpers_1 = require("@graphql-mesh/cross-helpers");
const importedModule$0 = require("./sources/SpectrumRouterBase/introspectionSchema");
const utils_5 = require("@graphql-mesh/utils");
const baseDir = cross_helpers_1.path.join(cross_helpers_1.path.dirname((0, utils_5.fileURLToPath)(import.meta.url)), '..');
const importFn = (moduleId) => {
    const relativeModuleId = (cross_helpers_1.path.isAbsolute(moduleId) ? cross_helpers_1.path.relative(baseDir, moduleId) : moduleId).split('\\').join('/').replace(baseDir + '/', '');
    switch (relativeModuleId) {
        case ".graphclient/sources/SpectrumRouterBase/introspectionSchema":
            return Promise.resolve(importedModule$0);
        default:
            return Promise.reject(new Error(`Cannot find module '${relativeModuleId}'.`));
    }
};
const rootStore = new store_1.MeshStore('.graphclient', new store_1.FsStoreStorageAdapter({
    cwd: baseDir,
    importFn,
    fileType: "ts",
}), {
    readonly: true,
    validate: false
});
exports.rawServeConfig = undefined;
async function getMeshOptions() {
    const pubsub = new utils_2.PubSub();
    const sourcesStore = rootStore.child('sources');
    const logger = new utils_3.DefaultLogger("GraphClient");
    const cache = new cache_localforage_1.default({
        ...{},
        importFn,
        store: rootStore.child('cache'),
        pubsub,
        logger,
    });
    const sources = [];
    const transforms = [];
    const additionalEnvelopPlugins = [];
    const spectrumRouterBaseTransforms = [];
    const spectrumRouterBaseHandler = new graphql_1.default({
        name: "SpectrumRouterBase",
        config: { "endpoint": "https://{context.url:api.studio.thegraph.com/query/4791/spectrum-router-base/v0.0.2}" },
        baseDir,
        cache,
        pubsub,
        store: sourcesStore.child("SpectrumRouterBase"),
        logger: logger.child("SpectrumRouterBase"),
        importFn,
    });
    sources[0] = {
        name: 'SpectrumRouterBase',
        handler: spectrumRouterBaseHandler,
        transforms: spectrumRouterBaseTransforms
    };
    const additionalTypeDefs = [(0, graphql_2.parse)("extend type Pool {\n  chainId: String!\n}"),];
    const additionalResolvers = [];
    const merger = new merger_bare_1.default({
        cache,
        pubsub,
        logger: logger.child('bareMerger'),
        store: rootStore.child('bareMerger')
    });
    return {
        sources,
        transforms,
        additionalTypeDefs,
        additionalResolvers,
        cache,
        pubsub,
        merger,
        logger,
        additionalEnvelopPlugins,
        get documents() {
            return [
                {
                    document: exports.PoolsDocument,
                    get rawSDL() {
                        return (0, utils_4.printWithCache)(exports.PoolsDocument);
                    },
                    location: 'PoolsDocument.graphql'
                }
            ];
        },
        fetchFn: fetch_1.fetch,
    };
}
exports.getMeshOptions = getMeshOptions;
function createBuiltMeshHTTPHandler() {
    return (0, http_1.createMeshHTTPHandler)({
        baseDir,
        getBuiltMesh: getBuiltGraphClient,
        rawServeConfig: undefined,
    });
}
exports.createBuiltMeshHTTPHandler = createBuiltMeshHTTPHandler;
let meshInstance$;
function getBuiltGraphClient() {
    if (meshInstance$ == null) {
        meshInstance$ = getMeshOptions().then(meshOptions => (0, runtime_1.getMesh)(meshOptions)).then(mesh => {
            const id = mesh.pubsub.subscribe('destroy', () => {
                meshInstance$ = undefined;
                mesh.pubsub.unsubscribe(id);
            });
            return mesh;
        });
    }
    return meshInstance$;
}
exports.getBuiltGraphClient = getBuiltGraphClient;
const execute = (...args) => getBuiltGraphClient().then(({ execute }) => execute(...args));
exports.execute = execute;
const subscribe = (...args) => getBuiltGraphClient().then(({ subscribe }) => subscribe(...args));
exports.subscribe = subscribe;
function getBuiltGraphSDK(globalContext) {
    const sdkRequester$ = getBuiltGraphClient().then(({ sdkRequesterFactory }) => sdkRequesterFactory(globalContext));
    return getSdk((...args) => sdkRequester$.then(sdkRequester => sdkRequester(...args)));
}
exports.getBuiltGraphSDK = getBuiltGraphSDK;
exports.PoolsDocument = (0, utils_1.gql) `
    query Pools($factory: String!, $blockNumber: BigInt!, $first: Int!, $skip: Int!) {
  pools(
    where: {factory: $factory, blockNumber_gte: $blockNumber}
    first: $first
    skip: $skip
    orderBy: blockNumber
    orderDirection: asc
  ) {
    blockNumber
    id
    stable
    token0 {
      id
      decimals
    }
    token1 {
      id
      decimals
    }
  }
}
    `;
function getSdk(requester) {
    return {
        Pools(variables, options) {
            return requester(exports.PoolsDocument, variables, options);
        }
    };
}
exports.getSdk = getSdk;
//# sourceMappingURL=index.js.map