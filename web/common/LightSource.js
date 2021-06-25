/** @module LightSource */

/**
 * Object that creates a light source and passes its information to the shaders
 */
export default class LightSource {
    // Number of total light sources
    static lightsCount = 0;

    /**
     * 
     * @param {Array<number>} position Position of light source
     * @param {Array<WebGLProgram>} programs List of shader programs that
     *  implement lighting
     * @param {Object} [options={}] Options object for further settings
     * @param {Array<number>} options.Id Diffuse intensity factor
     * @param {Array<number>} options.Is Specular intensity factor
     * @param {Array<number>} options.c Attenuation factor constants
     */
    constructor(position, programs, options = {}) {
        this.Id = options.Id == undefined ? [0.8, 0.8, 0.8] : options.Id;
        this.Is = options.Is == undefined ? [1, 1, 1] : options.Is;
        this.c = options.c == undefined ? [1, 0, 0] : options.c;
        this.position = position;
        if (this.position.length == 3) {
            this.position.push(1);
        }

        // Pass light source to all lighting shaders
        for (const programIndex in programs) {
            const program = programs[programIndex];
            GL.useProgram(program);

            const IdLocV = GL.getUniformLocation(program,
                `Id[${LightSource.lightsCount}]`);
            const IsLocV = GL.getUniformLocation(program,
                `Is[${LightSource.lightsCount}]`);
            const lightPositionLocV = GL.getUniformLocation(program,
                `lPosition[${LightSource.lightsCount}]`);
            const c1Loc = GL.getUniformLocation(program,
                `c1[${LightSource.lightsCount}]`);
            const c2Loc = GL.getUniformLocation(program,
                `c2[${LightSource.lightsCount}]`);
            const c3Loc = GL.getUniformLocation(program,
                `c3[${LightSource.lightsCount}]`);
            GL.uniform3fv(IdLocV, this.Id);
            GL.uniform3fv(IsLocV, this.Is);
            GL.uniform4fv(lightPositionLocV, this.position);
            GL.uniform1f(c1Loc, this.c[0]);
            GL.uniform1f(c2Loc, this.c[1]);
            GL.uniform1f(c3Loc, this.c[2]);
        }

        // Increment total amount of light sources
        LightSource.lightsCount++;
    }
}