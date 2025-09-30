

let AssetServer = null;


export function registerAssetServer(server) {
    AssetServer = server;
}

export function get(url) {
    if (AssetServer) {
        return AssetServer(url);
    }
    return null;
}

export default { get }
