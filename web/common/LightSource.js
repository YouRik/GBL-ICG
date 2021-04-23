/** @module LightSource */

import * as GLM from './lib/gl-matrix/index.js'

export default class LightSource {
    constructor(position, programs, options = {}) {
        this.Ia = options.Ia;
        this.Id = options.Id == undefined ? [0.8, 0.8, 0.8] : options.Id;
        this.Is = options.Is == undefined ? [1, 1, 1] : options.Is;
        this.c1 = options.c1 == undefined ? 1 : options.c1;
        this.c2 = options.c2 == undefined ? 0 : options.c2;
        this.c3 = options.c3 == undefined ? 0 : options.c3;
        this.position = position;

        // TODO: make light variables in shaders arrays and pass index and count
        // TODO: pass c1, c2, c3

        // Pass light source to all lighting shaders
        for (const programIndex in programs) {
            const program = programs[programIndex];

            if (this.Ia != undefined) {
                const IaLocV = GL.getUniformLocation(program, 'Ia');
                GL.uniform3fv(IaLocV, this.Ia);
            }

            const IdLocV = GL.getUniformLocation(program,
                `Id[${LightSource.lightsCount}]`);
            const IsLocV = GL.getUniformLocation(program,
                `Is[${LightSource.lightsCount}]`);
            const lightPositionLocV = GL.getUniformLocation(program,
                `lPosition[${LightSource.lightsCount}]`);
            GL.useProgram(program);
            GL.uniform3fv(IdLocV, this.Id);
            GL.uniform3fv(IsLocV, this.Is);
            GL.uniform3fv(lightPositionLocV, this.position);
        }

        LightSource.lightsCount++;
    }

    static lightsCount = 0;
}