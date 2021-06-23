/** @module FirstPersonPlayer */

import * as CANNON from './lib/cannon/cannon-es.js';
import * as GLMAT from './lib/gl-matrix/index.js';
import SphereObject from './GameObjects/SphereObject.js';

// TODO: documentation
export default class FirstPersonPlayer {
    constructor(world, position, programs, jointMesh, aspectRatio, yaw = 0, pitch = 0) {
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

        // Initialize movement and control state variables
        this.controls = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            isOnGround: false,
            wantsToJump: false,
            isCarrying: false,
            isPickingUp: false,
            isDropping: false,
            pointerX: 0,
            pointerY: 0,
            carryDistance: 2,
        };

        // Player configuration
        this.moveForce = 1000;
        this.jumpImpulse = 666;
        this.brakeForce = 400;
        this.maxMoveSpeed = 9;
        this.maxCarryDistance = 4;
        this.minCarryDistance = 1;
        this.carryForce = 10;
        this.groundCheckDistance = 1.3;

        // Store angular damping of carried object before picking up
        this.prevCarriedAngularDamping = 0.01;

        // Initialize camera values and view matrix
        this.cameraOffsetY = 0.55;
        this.sensitivity = 0.25;
        this.yaw = yaw;
        this.pitch = pitch;
        this.viewDirection = GLMAT.vec3.create();
        this.viewMatrix = GLMAT.mat4.create();

        // Set and pass perspective matrix
        this.setPerspectiveMatrix(aspectRatio);

        // Set initial position
        this.position = GLMAT.vec3.fromValues(
            position[0], position[1] + this.cameraOffsetY, position[2]);

        // Create physics body
        this.physicsBody = new CANNON.Body({
            mass: 70,
            position: new CANNON.Vec3(position[0], position[1], position[2]),
            fixedRotation: true,
            collisionFilterGroup: 4,
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

        // Create sphere as joint body and visual indicator
        this.jointSphere = new SphereObject(world, programs['colored'],
            'colored', jointMesh, {
            radius: 0.1,
            color: [1, 0, 0, 0.75],
            mass: 0,
            collisionFilterGroup: 0,
            collisionFilterMask: 0,
            fixedRotation: true
        });
        this.jointSphere.visible = false;
        this.jointSphere.castsShadow = false;

        this.groundObjects = new Set();

        // World event listener for contact exits
        this.world.addEventListener('endContact', (event) => {
            this.handleCollisionEnd(event);
        });

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

    setViewMatrix() {
        // Calculate target position to look at
        const target = GLMAT.vec3.create();
        GLMAT.vec3.add(target, this.position, this.viewDirection);
        // Calculate view matrix
        GLMAT.mat4.lookAt(this.viewMatrix, this.position, target,
            [0, 1, 0]);
        // Pass to all shaders
        this.programs.forEach(program => {
            GL.useProgram(program[0]);
            GL.uniformMatrix4fv(program[1], false, this.viewMatrix);
        });
    }

    /**
     * Handle movement input keys up
     * @param {KeyboardEvent} event
     */
    keyUp(event) {
        switch (event.key) {
            case 'w':
                this.controls.forward = false;
                break;
            case 's':
                this.controls.backward = false;
                break;
            case 'a':
                this.controls.left = false;
                break;
            case 'd':
                this.controls.right = false;
                break;
            case ' ':
                this.controls.wantsToJump = false;
                break;
        }
    }

    /**
     * Handle movement input keys down
     * @param {KeyboardEvent} event 
     */
    keyDown(event) {
        switch (event.key) {
            case 'w':
                this.controls.forward = true;
                break;
            case 's':
                this.controls.backward = true;
                break;
            case 'a':
                this.controls.left = true;
                break;
            case 'd':
                this.controls.right = true;
                break;
            case ' ':
                this.controls.wantsToJump = true;
                break;
        }
    }

    pointerDown(event) {
        if (!this.controls.isCarrying) {
            this.controls.isPickingUp = true;
        }
    }

    pointerUp(event) {
        this.controls.isPickingUp = false;
        if (this.controls.isCarrying) {
            this.controls.isDropping = true;
        }
    }

    pointerMove(event) {
        // Calculate offsets
        this.controls.pointerX += event.movementX;
        this.controls.pointerY += event.movementY;
    }

    wheel(event) {
        if (this.controls.isCarrying) {
            if (event.deltaY > 0) {
                this.controls.carryDistance -= 0.2;
                if (this.controls.carryDistance < this.minCarryDistance) {
                    this.controls.carryDistance = this.minCarryDistance;
                }
            } else if (event.deltaY < 0) {
                this.controls.carryDistance += 0.2;
                if (this.controls.carryDistance > this.maxCarryDistance) {
                    this.controls.carryDistance = this.maxCarryDistance;
                }
            }
        }
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
        if (contactNormal.dot(new CANNON.Vec3(0, 1, 0)) > 0.5) {
            this.controls.isOnGround = true;
            this.groundObjects.add(event.body);
        }
    }

    handleCollisionEnd(event) {
        if (event.bodyA === this.physicsBody) {
            this.groundObjects.delete(event.bodyB);
        }
        if (event.bodyB === this.physicsBody) {
            this.groundObjects.delete(event.bodyA);
        }
        if (this.groundObjects.size == 0) {
            this.controls.isOnGround = false;
        }
    }

    update(deltaTime) {
        // Calculate new yaw and pitch values in degrees
        this.yaw -= this.controls.pointerX * this.sensitivity;
        this.pitch -= this.controls.pointerY * this.sensitivity;
        this.controls.pointerX = 0;
        this.controls.pointerY = 0;

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
        this.viewDirection = viewDirection;

        // Get move direction factors
        let forwardFactor = 0;
        let rightFactor = 0;
        if (this.controls.forward) {
            forwardFactor += 1;
        }
        if (this.controls.backward) {
            forwardFactor -= 1;
        }
        if (this.controls.left) {
            rightFactor -= 1;
        }
        if (this.controls.right) {
            rightFactor += 1;
        }
        if (this.controls.wantsToJump && this.controls.isOnGround) {
            this.physicsBody.applyImpulse(
                new CANNON.Vec3(0, this.jumpImpulse, 0));
            this.controls.isOnGround = false;
        }

        // Get direction to move in
        const forwardDirection = [viewDirection[0], 0, viewDirection[2]];
        const rightDirection = GLMAT.vec3.create();
        GLMAT.vec3.cross(rightDirection, forwardDirection, [0, 1, 0]);
        GLMAT.vec3.normalize(forwardDirection, forwardDirection);
        GLMAT.vec3.normalize(rightDirection, rightDirection);
        const movementDirection = [
            (forwardDirection[0] * forwardFactor
                + rightDirection[0] * rightFactor),
            (forwardDirection[2] * forwardFactor
                + rightDirection[2] * rightFactor)
        ];
        GLMAT.vec2.normalize(movementDirection, movementDirection);

        // Apply forces for movement
        this.physicsBody.force = new CANNON.Vec3(
            movementDirection[0] * this.moveForce,
            this.physicsBody.force.y,
            movementDirection[1] * this.moveForce
        );

        // Apply counter forces for braking and limiting maximum velocity
        const hVelocity = GLMAT.vec3.fromValues(
            this.physicsBody.velocity.x, 0, this.physicsBody.velocity.z);
        const hVelocityDir = GLMAT.vec3.create();
        GLMAT.vec3.normalize(hVelocityDir, hVelocity);
        const hVelocityLen = GLMAT.vec3.length(hVelocity);

        const overspeedAmount = Math.max(0, hVelocityLen - this.maxMoveSpeed);
        const brakeFactorForward =
            GLMAT.vec3.dot(hVelocityDir, forwardDirection)
            * ((forwardFactor == 0) * -hVelocityLen * this.brakeForce
                + (forwardFactor != 0) * -overspeedAmount * this.moveForce);
        const brakeFactorRight =
            GLMAT.vec3.dot(hVelocityDir, rightDirection)
            * ((rightFactor == 0) * -hVelocityLen * this.brakeForce
                + (rightFactor != 0) * -overspeedAmount * this.moveForce);
        
        const brakeForce = GLMAT.vec3.create();
        GLMAT.vec3.scale(brakeForce, forwardDirection, brakeFactorForward);
        GLMAT.vec3.scaleAndAdd(brakeForce, brakeForce, rightDirection,
            brakeFactorRight);
        this.physicsBody.applyForce(new CANNON.Vec3(
            brakeForce[0], brakeForce[1], brakeForce[2]));

        // Update player position from physics
        const posValues = this.physicsBody.position.toArray();
        this.position = GLMAT.vec3.fromValues(
            posValues[0], posValues[1] + this.cameraOffsetY, posValues[2]);

        // Calculate view matrix and pass to all shaders
        this.setViewMatrix();

        // Update joint body and constraint positions
        this.jointSphere.physicsBody.position = new CANNON.Vec3(
            this.position[0] + viewDirection[0] * this.controls.carryDistance,
            this.position[1] + viewDirection[1] * this.controls.carryDistance,
            this.position[2] + viewDirection[2] * this.controls.carryDistance);
        if (this.controls.isCarrying) {
            this.jointConstraint.update();
        }

        // Pick up object if desired and portable object is in front
        if (this.controls.isPickingUp) {
            this.controls.isPickingUp = false;

            // Shoot ray in view direction to check for portable object
            const ray = new CANNON.Ray(
                new CANNON.Vec3(this.position[0], this.position[1],
                    this.position[2]),
                new CANNON.Vec3(
                    this.position[0] + viewDirection[0] * this.maxCarryDistance,
                    this.position[1] + viewDirection[1] * this.maxCarryDistance,
                    (this.position[2] + viewDirection[2]
                        * this.maxCarryDistance)));
            let castResult = new CANNON.RaycastResult();
            const hasHit = ray.intersectWorld(this.world, {
                result: castResult,
                collisionFilterMask: 2
            });

            if (hasHit) {
                this.controls.isCarrying = true;
                const hitPoint = castResult.hitPointWorld;
                this.controls.carryDistance = (new CANNON.Vec3(this.position[0],
                    this.position[1], this.position[2]).distanceTo(hitPoint));

                // Calculate constraint position offset
                // Vector that goes from the body to the clicked point
                const vector = new CANNON.Vec3().copy(hitPoint).vsub(
                    castResult.body.position);
                // Apply anti-quaternion to vector to transform it into the
                // local body coordinate system
                const antiRotation = castResult.body.quaternion.inverse();
                // pivot is not in local body coordinates
                const pivot = antiRotation.vmult(vector);

                // Set constraint to carry the object
                this.jointConstraint = new CANNON.PointToPointConstraint(
                    castResult.body, pivot,
                    this.jointSphere.physicsBody, new CANNON.Vec3(0, 0, 0),
                    this.carryForce);
                this.world.addConstraint(this.jointConstraint);
                // Reduce rotation of object with angular damping
                this.prevCarriedAngularDamping =
                    this.jointConstraint.bodyA.angularDamping;
                this.jointConstraint.bodyA.angularDamping = 0.9;

                // Make indicator visible
                this.jointSphere.visible = true;
            }
        }

        // Drop object if desired or carried object is too far
        if (this.controls.isDropping
            // || (this.controls.isCarrying
            //     && this.jointConstraint.bodyA.position.distanceTo(
            //         this.jointConstraint.bodyB.position) > 2.5)
            ) {
            this.controls.isDropping = false;
            this.controls.isCarrying = false;
            // Reset angular damping on object
            this.jointConstraint.bodyA.angularDamping =
                this.prevCarriedAngularDamping;
            // Remove constraint
            this.world.removeConstraint(this.jointConstraint);
            this.jointConstraint = undefined;

            // Make indicator invisible
            this.jointSphere.visible = false;
        }
    }
}