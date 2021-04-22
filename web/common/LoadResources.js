/** @module LoadResources */

// TODO: documentation here
/**
 * Load the stage file. This
 * @param {string} stagePath Stage file path
 * @returns {}
 */
export function loadStage(stagePath) {
    return fetchAndDecode('stage', stagePath);
}

/**
 * Async function responsible for retrieving all shaders, textures and meshes
 * from the server at once
 * @param {Array<Array<string>>} shaderPaths Array containing pairs of shader
 *  name and shader path
 * @param {Array<Array<string>>} texturePaths Array containing pairs of texture
 *  name and texture path
 * @param {Array<Array<string>>} meshPaths Array containing pairs of mesh name
 *  and mesh path
 * @returns {Promise<Object>} The object containing the resources wrapped in a
 *  promise
 */
export async function loadResources(
        shaderPaths, texturePaths, meshPaths) {
    const resources = {
        shaders: {},
        textures: {},
        meshes: {}
    };

    const loading = [];

    // Load shaders
    if (shaderPaths) {
        const shaderLoading = [];
        shaderPaths.forEach(pair => {
            shaderLoading.push(fetchAndDecode('shader', pair[1], pair[0]));
        });
        loading.push(Promise.all(shaderLoading).then(shaders => {
            shaders.forEach(pair => {
                resources.shaders[pair[0]] = pair[1];
            });
        }));
    }
    // Load textures
    if (texturePaths) {
        const textureLoading = [];
        texturePaths.forEach(pair => {
            textureLoading.push(fetchAndDecode('texture', pair[1], pair[0]));
        });
        loading.push(Promise.all(textureLoading).then(textures => {
            textures.forEach(pair => {
                resources.textures[pair[0]] = pair[1];
            });
        }));
    }
    // Load meshes
    if (meshPaths) {
        const meshLoading = [];
        meshPaths.forEach(pair => {
            meshLoading.push(fetchAndDecode('mesh',pair[0], pair[1]));
        });
        loading.push(Promise.all(meshLoading).then(meshes => {
            meshes.forEach(pair => {
                resources.meshes[pair[0]] = pair[1];
            });
        }));
    }

    return Promise.all(loading).then(() => {
        return resources;
    });
}

/**
 * Get a resource from the server and return its value wrapped in a Promise
 * @param {string} type The resource type. One of 'shader', 'texture', 'mesh',
 *  'stage'
 * @param {string} url The resource's URL
 * @param {string} [name] The resource's name. Required for shaders, textures
 *  and meshes. Unnecessary for stage
 * @returns {Promise<Array>} The resulting pair of name and resource
 */
function fetchAndDecode(type, url, name) {
    return fetch(url).then(response => {
        if (response.status != 200) {
            return Promise.reject(response.statusText);
        } else if (type == 'shader') {
            // Return shader
            return response.text().then(shader => {
                return [name, shader];
            });
        } else if (type == 'texture') {
            // Create texture image and return
            return response.blob().then(async textureBlob => {
                const textureImage = new Image();
                const imageLoading = new Promise((resolve) => {
                    textureImage.addEventListener('load', resolve);
                });
                textureImage.src = URL.createObjectURL(textureBlob);
                await imageLoading;
                return [name, textureImage];
            });
        } else if (type == 'mesh') {
            // Return mesh in correct format
            // TODO: correct mesh loading
            return response.json().then(mesh => {
                return [name, mesh];
            });
        } else if (type == 'stage') {
            return response.json();
        }
    }).catch(error => {
        console.log(error);
        throw new LoadResourceError(name, url, error);
    })
}

/**
 * Error for failed loading of resource
 * @extends Error
 */
class LoadResourceError extends Error {
    /**
     * Construct error for failure on resource loading
     * @param {string} resourceName The failed resource's name
     * @param {string} resourceUrl The failed resource's URL
     * @param {string} [extra] Additional error information
     */
    constructor(resourceName, resourceUrl, extra = '') {
        const message = `Resource ${resourceName} could not be loaded from `
                        + `${resourceUrl}. ` + extra;
        super(message);
        this.name = 'LoadResourceError';
    }
}