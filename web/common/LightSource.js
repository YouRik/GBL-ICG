/** @module LightSource */

import * as GLM from './lib/gl-matrix/index.js'

export default class LightSource {
    constructor(position, programs, options = {}) {
        this.Ia = options.Ia;
        this.Id = options.Id == undefined ? [0.8, 0.8, 0.8] : options.Id;
        this.Is = options.Is == undefined ? [1, 1, 1] : options.Is;
        this.c = options.c == undefined ? [1, 0, 0] : options.c;
        this.position = position;
        console.log(this.c);

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
            const c1Loc = GL.getUniformLocation(program,
                `c1[${LightSource.lightsCount}]`);
            const c2Loc = GL.getUniformLocation(program,
                `c2[${LightSource.lightsCount}]`);
            const c3Loc = GL.getUniformLocation(program,
                `c3[${LightSource.lightsCount}]`);
            GL.useProgram(program);
            GL.uniform3fv(IdLocV, this.Id);
            GL.uniform3fv(IsLocV, this.Is);
            GL.uniform3fv(lightPositionLocV, this.position);
            GL.uniform1f(c1Loc, this.c[0]);
            GL.uniform1f(c2Loc, this.c[1]);
            GL.uniform1f(c3Loc, this.c[2]);
        }

        LightSource.lightsCount++;
    }

    static lightsCount = 0;
}