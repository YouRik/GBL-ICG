/** @module MeshObject */

import GameObject from './GameObject.js';
import * as CANNON from '../lib/cannon/cannon-es.js';

/**
 * A game object with a loaded graphical and physical mesh
 * @extends GameObject
 */
export default class MeshObject extends GameObject {
    /**
     * @param {CANNON.World} world The physical world to add the mesh object to
     * @param {WebGLProgram} program The shader program to use for rendering
     * @param {string} shaderType The type of shader used. 'colored' or 'lit'
     * @param {Array<Object>} meshes List of meshes used for physics. These
     *  meshes must each be convex and have no coplanar faces
     * @param {object} [options={}] Optional options for the object
     * @param {object} [options.graphicalMesh] An object representing the
     *  graphical mesh. This mesh must be triangulated.
     *  If none is given, one will be constructed from the physics meshes
     * @param {Array<number>} [options.position] The object's default position
     * @param {Array<number>} [options.orientation] The object's default
     *  orientation
     * @param {Array<number>} [options.scale] The object's default scale
     * @param {number} [options.mass] The object's mass
     * @param {Array<number>} [options.color] The object's color
     * @param {Object} [options.lightParams] The object's light coefficients
     * @param {boolean} [options.portable] Whether the object can be picked
     * @param {number} [options.collisionFilterGroup] The object's collision
     *  group
     * @param {number} [options.collisionFilterMask] The object's collision
     *  mask
     */
    constructor(world, program, shaderType, meshes, options = {}) {
        let graphicalMesh = options.graphicalMesh;
        const scale = options.scale == undefined ? [1, 1, 1] : options.scale;

        const opts = options;
        opts.scale = scale;
        super(program, shaderType, opts);

        // Generate combined physics mesh from meshes and scale
        meshes.forEach(mesh => {
            const vertices = [];
            const faces = [];
            for (let i = 0; i < mesh.positions.length; i += 3) {
                vertices.push(new CANNON.Vec3(
                    mesh.positions[i] * scale[0],
                    mesh.positions[i + 1] * scale[1],
                    mesh.positions[i + 2] * scale[2]));
            }
            let faceStart = 0;
            for (let i = 0; i < mesh.faceIndexCounts.length; i++) {
                const count = parseInt(mesh.faceIndexCounts[i]);
                const indices = [];
                for (let j = 0; j < count; j++) {
                    indices.push(mesh.indices[faceStart + j]);
                }
                faces.push(indices);
                faceStart += count;
            }
            const physicsMesh = new CANNON.ConvexPolyhedron(
                { vertices, faces });
            this.physicsBody.addShape(physicsMesh);
        });

        // Generate a graphical mesh from the physics meshes if none is defined
        if (graphicalMesh == undefined) {
            graphicalMesh = {
                positions: [],
                normals: [],
                indices: [],
                faceIndexCounts: [],
            };
            // Iterate through physics meshes and combine into graphical mesh
            meshes.forEach(mesh => {
                const indexOffset = graphicalMesh.positions.length / 3;
                graphicalMesh.positions =
                    graphicalMesh.positions.concat(mesh.positions);
                graphicalMesh.normals =
                    graphicalMesh.normals.concat(mesh.normals);
                
                // Iterate through faces and (fan) triangulate
                let faceStart = 0;
                for (let i = 0; i < mesh.faceIndexCounts.length; i++) {
                    const count = mesh.faceIndexCounts[i];
                    for (let j = 2; j < count; j++) {
                        graphicalMesh.indices.push(
                            mesh.indices[faceStart] + indexOffset);
                        graphicalMesh.indices.push(
                            mesh.indices[faceStart + j - 1] + indexOffset);
                        graphicalMesh.indices.push(
                            mesh.indices[faceStart + j] + indexOffset);
                        graphicalMesh.faceIndexCounts.push(3);
                    }
                    faceStart += count;
                }
            });
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

    /**
     * Initialize the game object's VBOs
     * @param {Object} mesh The object representing the graphical mesh
     */
    initVBOs(mesh) {
        this.initVBOsWithMesh(mesh);
    }
}