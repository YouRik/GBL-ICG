/** @module MeshObject */

import GameObject from "./GameObject.js";
import * as CANNON from './lib/cannon/cannon-es.js';

/**
 * TODO: documentation
 */
export default class MeshObject extends GameObject {
    constructor(world, program, shaderType, meshes, options = {}) {
        let graphicalMesh = options.graphicalMesh;
        const scale = options.scale == undefined ? [1, 1, 1] : options.scale;

        super(program, shaderType, {
            position: options.position,
            orientation: options.orientation,
            scale: scale,
            mass: options.mass,
            color: options.color,
            lightParams: options.lightParams
        });

        // generate combined physics mesh from meshes and scale
        meshes.forEach(mesh => {
            const vertices = [];
            const faces = [];
            for (let i = 0; i < mesh.positions.length; i += 3) {
                vertices.push(new CANNON.Vec3(
                    mesh.positions[i] * scale[0],
                    mesh.positions[i + 1] * scale[1],
                    mesh.positions[i + 2] * scale[2]));
            }
            let firstIndex = 0;
            for (let i = 0; i < mesh.faceIndexCounts.length; i++) {
                const count = parseInt(mesh.faceIndexCounts[i]);
                const indices = [];
                for (let j = 0; j < count; j++) {
                    indices.push(mesh.indices[firstIndex + j]);
                }
                faces.push(indices);
                firstIndex += count;
            }
            const physicsMesh = new CANNON.ConvexPolyhedron(
                { vertices, faces });
            this.physicsBody.addShape(physicsMesh);
        });

        if (graphicalMesh == undefined) {
            // TODO: Combine graphical mesh from separate physics meshes
            // Iterate through meshes and triangulate faces
            graphicalMesh = {};
            throw Error('Graphical mesh not set');
        } else {
            // Check that the mesh is triangulated
            graphicalMesh.faceIndexCounts.forEach(count => {
                if (count != 3) {
                    throw Error('Graphical mesh not triangulated');
                }
            });
        }

        world.addBody(this.physicsBody);
        this.initVBOs(graphicalMesh);
    }

    initVBOs(mesh) {
        this.positionCount = mesh.positions.length;
        this.indexCount = mesh.indices.length;
        let vertices = [];

        if (this.shaderType == 'colored') {
            const colors = [];
            for (let i = 0; i < positions.length; i++) {
                this.colors.forEach(value => {
                    colors.push(value);
                });
            }
            vertices = mesh.positions.concat(colors);
        } else if (this.shaderType == 'lit') {
            vertices = mesh.positions.concat(mesh.normals);
        }

        this.dataVBO = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.dataVBO);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertices),
            GL.DYNAMIC_DRAW);

        this.indexVBO = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexVBO);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices),
            GL.DYNAMIC_DRAW);
    }
}