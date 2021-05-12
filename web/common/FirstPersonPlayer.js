/** @module FirstPersonPlayer */

import * as CANNON from './lib/cannon/cannon-es.js';
import * as GLMAT from './lib/gl-matrix/index.js';

// TODO: documentation
export default class FirstPersonPlayer {
    constructor(world, position, programs, aspectRatio, yaw = 0, pitch = 0) {
        this.programs = [];
        for (const programName in programs) {
            const program = programs[programName];
            this.programs.push([
                program,
                GL.getUniformLocation(program, 'viewMatrix'),
                GL.getUniformLocation(program, 'projectionMatrix')
            ]);
        }
        this.world = world;

        // Initialize movement variables
        this.movement = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            canJump: false,
            isJumping: false,
            isCarrying: false,
            isPickingUp: false,
            isDropping: false,
            pointerX: 0,
            pointerY: 0
        };
        this.moveSpeed = 9;
        this.jumpSpeed = 10;
        this.pickUpDistance = 3;
        this.carryDistance = 2;
        this.carryForce = 8;

        // Initialize camera values and view matrix
        this.cameraOffsetY = 0.55;
        this.sensitivity = 0.25;
        this.yaw = yaw;
        this.pitch = pitch;
        this.viewMatrix = GLMAT.mat4.create();

        // Set and pass perspective matrix
        this.setPerspectiveMatrix(aspectRatio);

        // Set initial position
        this.position = GLMAT.vec3.fromValues(
            position[0], position[1] + this.cameraOffsetY, position[2]);

        // Create physics body
        this.physicsBody = new CANNON.Body({
            mass: 5,
            position: new CANNON.Vec3(position[0], position[1], position[2]),
            fixedRotation: true,
            material: new CANNON.Material({
                friction: 0,
                restitution: 0
            })
        });
        this.physicsBody.addShape(new CANNON.Sphere(0.35),
            new CANNON.Vec3(0, -0.55, 0));
        this.physicsBody.addShape(new CANNON.Sphere(0.35));
        this.physicsBody.addShape(new CANNON.Sphere(0.35),
            new CANNON.Vec3(0, 0.55, 0));
        this.physicsBody.addEventListener('collide', event => {
            this.handleCollision(event);
        });
        world.addBody(this.physicsBody);

        // Create joint body for picking up objects
        this.jointBody = new CANNON.Body({
            collisionFilterMask: 0,
            collisionFilterGroup: 0,
            fixedRotation: true
        });
        world.addBody(this.jointBody);

        this.update(0);
    }

    setPerspectiveMatrix(aspectRatio) {
        this.projectionMatrix = GLMAT.mat4.create();
        GLMAT.mat4.perspective(this.projectionMatrix, 1, aspectRatio, 0.1, 500);
        this.programs.forEach(program => {
            GL.useProgram(program[0]);
            GL.uniformMatrix4fv(program[2], false, this.projectionMatrix);
        });
    }

    /**
     * Handle movement input keys up
     * @param {KeyboardEvent} event
     */
    keyUp(event) {
        switch (event.key) {
            case 'w':
                this.movement.forward = false;
                break;
            case 's':
                this.movement.backward = false;
                break;
            case 'a':
                this.movement.left = false;
                break;
            case 'd':
                this.movement.right = false;
                break;
        }
        event.preventDefault();
    }

    /**
     * Handle movement input keys down
     * @param {KeyboardEvent} event 
     */
    keyDown(event) {
        switch (event.key) {
            case 'w':
                this.movement.forward = true;
                break;
            case 's':
                this.movement.backward = true;
                break;
            case 'a':
                this.movement.left = true;
                break;
            case 'd':
                this.movement.right = true;
                break;
            case ' ':
                if (this.movement.canJump) {
                    this.movement.isJumping = true;
                    this.movement.canJump = false;
                }
        }
        event.preventDefault();
    }
    
    pointerDown(event) {
        if (!this.movement.isCarrying) {
            this.movement.isPickingUp = true;
        }
    }

    pointerUp(event) {
        this.movement.isPickingUp = false;
        if (this.movement.isCarrying) {
            this.movement.isDropping = true;
        }
    }

    pointerMove(event) {
        // Calculate offsets
        this.movement.pointerX += event.movementX;
        this.movement.pointerY += event.movementY;
    }

    handleCollision(event) {
        let contactNormal = new CANNON.Vec3();
        // Check collision objects, negate collision normal if necessary
        if (event.contact.bi.id === this.physicsBody.id) {
            contactNormal = event.contact.ni.negate();
        } else {
            contactNormal = event.contact.ni;
        }

        // Check if collision normal points up enough
        if (contactNormal.dot(new CANNON.Vec3(0, 1, 0)) > 0.85) {
            this.movement.canJump = true;
        }
    }

    update(deltaTime) {
        // Calculate new yaw and pitch values in degrees
        this.yaw -= this.movement.pointerX * this.sensitivity;
        this.pitch -= this.movement.pointerY * this.sensitivity;
        this.movement.pointerX = 0;
        this.movement.pointerY = 0;

        // Clamp pitch to +-89 degrees
        if (this.pitch > 89) {
            this.pitch = 89;
        } else if (this.pitch < -89) {
            this.pitch = -89;
        }

        // Update camera view direction
        const viewDirection = [
            Math.sin(this.yaw * Math.PI / 180)
            * Math.cos(this.pitch * Math.PI / 180),
            Math.sin(this.pitch * Math.PI / 180),
            Math.cos(this.yaw * Math.PI / 180)
            * Math.cos(this.pitch * Math.PI / 180)
        ];
        GLMAT.vec3.normalize(viewDirection, viewDirection);

        // Update player velocity
        const forwardDirection = [viewDirection[0], 0, viewDirection[2]];
        const rightDirection = GLMAT.vec3.create();
        GLMAT.vec3.cross(rightDirection, forwardDirection, [0, 1, 0]);
        GLMAT.vec3.normalize(forwardDirection, forwardDirection);
        GLMAT.vec3.normalize(rightDirection, rightDirection);
        let forwardFactor = 0;
        let rightFactor = 0;

        // Get move direction factors
        if (this.movement.forward) {
            forwardFactor += 1;
        }
        if (this.movement.backward) {
            forwardFactor -= 1;
        }
        if (this.movement.left) {
            rightFactor -= 1;
        }
        if (this.movement.right) {
            rightFactor += 1;
        }
        if (this.movement.isJumping) {
            this.physicsBody.velocity.y = this.jumpSpeed;
            this.movement.isJumping = false;
        }

        // Apply velocities
        this.physicsBody.velocity.x = (forwardDirection[0] * forwardFactor
            + rightDirection[0] * rightFactor)
            * this.moveSpeed;
        this.physicsBody.velocity.z = (forwardDirection[2] * forwardFactor
            + rightDirection[2] * rightFactor)
            * this.moveSpeed;

        // Update player position from physics
        const posValues = this.physicsBody.position.toArray();
        this.position = GLMAT.vec3.fromValues(
            posValues[0], posValues[1] + this.cameraOffsetY, posValues[2]);

        // Calculate target vector to look at
        const target = GLMAT.vec3.create();
        GLMAT.vec3.add(target, this.position, viewDirection);

        // Calculate view matrix and pass to all shaders
        GLMAT.mat4.lookAt(this.viewMatrix, this.position, target, [0, 1, 0]);
        this.programs.forEach(program => {
            GL.useProgram(program[0]);
            GL.uniformMatrix4fv(program[1], false, this.viewMatrix);
        });

        // Update joint body and constraint positions
        this.jointBody.position = new CANNON.Vec3(
            posValues[0] + viewDirection[0] * this.carryDistance,
            posValues[1] + viewDirection[1] * this.carryDistance
            + this.cameraOffsetY,
            posValues[2] + viewDirection[2] * this.carryDistance);
        if (this.movement.isCarrying) {
            this.jointConstraint.update();
        }

        // Pick up object if desired and portable object is in front
        if (this.movement.isPickingUp) {
            this.movement.isPickingUp = false;

            // Shoot ray in view direction to check for portable object
            const ray = new CANNON.Ray(
                new CANNON.Vec3(
                    posValues[0],
                    posValues[1] + this.cameraOffsetY,
                    posValues[2]),
                new CANNON.Vec3(
                    posValues[0] + viewDirection[0] * this.pickUpDistance,
                    posValues[1] + viewDirection[1] * this.pickUpDistance
                    + this.cameraOffsetY,
                    posValues[2] + viewDirection[2] * this.pickUpDistance));
            let castResult = new CANNON.RaycastResult();
            const hasHit = ray.intersectWorld(this.world, {
                result: castResult,
                collisionFilterMask: 2
            });

            if (hasHit) {
                // Set constraint to carry the object
                this.movement.isCarrying = true;
                this.jointConstraint = new CANNON.PointToPointConstraint(
                    castResult.body, new CANNON.Vec3(0, 0, 0),
                    this.jointBody, new CANNON.Vec3(0, 0, 0), this.carryForce);
                this.world.addConstraint(this.jointConstraint);
                // Reduce rotation of object with angular damping
                this.jointConstraint.bodyA.angularDamping = 0.9;
            }
        }

        // Drop object if desired or carried object is too far
        if (this.movement.isDropping
            || (this.movement.isCarrying
                && this.jointConstraint.bodyA.position.distanceTo(
                    this.jointConstraint.bodyB.position) > 2.5)) {
            this.movement.isDropping = false;
            this.movement.isCarrying = false;
            // Reset angular damping on object
            this.jointConstraint.bodyA.angularDamping = 0.01;
            // Remove constraint
            this.world.removeConstraint(this.jointConstraint);
            this.jointConstraint = undefined;
        }
    }
}