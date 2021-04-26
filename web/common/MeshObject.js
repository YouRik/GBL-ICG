/** @module MeshObject */

import GameObject from "./GameObject.js";
import * as CANNON from './lib/cannon/cannon-es.js';

/**
 * TODO: documentation
 */
export default class MeshObject extends GameObject {
    constructor(world, program, shaderType, meshes, options = {}) {
        let graphicalMesh = options.graphicalMesh;

        super(program, shaderType, {
            position: options.position,
            orientation: options.orientation,
            mass: options.mass,
            color: options.color,
            lightParams: options.lightParams
        });

        this.physicsBody = new CANNON.Body({
            mass: this.mass,
            type: this.mass == 0 ? CANNON.Body.STATIC : CANNON.Body.DYNAMIC,
            material: new CANNON.Material({
                friction: 1,
                restitution: 0.2
            })
        });

        // TODO: scale

        // generate combined physics mesh from meshes
        meshes.forEach(mesh => {
            const vertices = [];
            const faces = [];
            for (let i = 0; i < mesh.positions.length; i += 3) {
                vertices.push(new CANNON.Vec3(mesh.positions[i],
                    mesh.positions[i+1], mesh.positions[i+2]));
            }
            for (let i = 0; i < mesh.indices.length; i += 3) {
                faces.push(
                    [mesh.indices[i], mesh.indices[i+1], mesh.indices[i+2]]);
            }
            const physicsMesh = new CANNON.ConvexPolyhedron({vertices, faces});
            this.physicsBody.addShape(physicsMesh);
        });

        if (graphicalMesh == undefined) {
            // TODO: Combine graphical mesh from separate meshes
            graphicalMesh = {};
        }
        this.physicsBody.position.set(
            this.position[0], this.position[1], this.position[2]);
        this.physicsBody.quaternion.set(this.quaternion[0], this.quaternion[1],
            this.quaternion[2], this.quaternion[3]);

        // TODO: collision with other bodies is pretty weird.
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