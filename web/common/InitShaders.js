/** @module InitShaders */

/**
 * Create a WebGL program from shaders
 * @param {string} vertShaderSrc The vertex shader source string
 * @param {string} fragShaderSrc The fragment shader source string
 * @returns {WebGLProgram} WebGL program built from the shaders
 */
export default function initShaders(
    vertShaderSrc, fragShaderSrc) {
    // Compile the shaders
    const vertShader = compileShaders(GL.VERTEX_SHADER, vertShaderSrc);
    const fragShader = compileShaders(GL.FRAGMENT_SHADER, fragShaderSrc);
    // Build the program
    const program = GL.createProgram();

    // Attach the shaders to the program and link
    GL.attachShader(program, vertShader);
    GL.attachShader(program, fragShader);
    GL.linkProgram(program);

    return program;
}

/**
 * Loads a file from the server synchronously
 * @deprecated Load files asynchronously with loadResources instead
 * @param {string} filePath The file to load
 * @returns {string} The loaded file's contents
 */
function loadFile(filePath) {
    let result;
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open('GET', filePath, false);
    xmlhttp.send();
    if (xmlhttp.status == 200) {
        result = xmlhttp.responseText;
    }

    return result;
}

/**
 * Compile WebGL shader from source code string
 * @param {number} shaderType gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
 * @param {string} shaderString The shader's source string
 * @throws {ShaderCompilationError} Error if shader compilation fails
 * @returns {WebGLShader} Compiled WebGL shader
 */
function compileShaders(shaderType, shaderString) {
    // Create the shader
    const shader = GL.createShader(shaderType);
    // Set the shader source code
    GL.shaderSource(shader, shaderString);
    // Compile the shader to make it readable for the GPU
    GL.compileShader(shader);

    const success = GL.getShaderParameter(shader, GL.COMPILE_STATUS);
    if (!success) {
        // Something went wrong during compilation, get the error
        throw new ShaderCompilationError(
            shaderType, GL.getShaderInfoLog(shader));
    } else {
        return shader;
    }
}

/**
 * Error for failed compilation of shader
 * @extends Error
 */
class ShaderCompilationError extends Error {
    /**
     * Construct an error for failure of shader compilation
     * @param {number} shaderType gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
     *  context
     * @param {string} [extra] Additional error information 
     */
    constructor(shaderType, extra = '') {
        const message = (shaderType == GL.VERTEX_SHADER ? 'Vertex'
            : 'Fragment')
            + ' shader compilation failed: ' + extra;
        super(message);
        this.name = 'ShaderCompilationError';
    }
}