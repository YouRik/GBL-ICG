#version 300 es
#define MAX_LIGHTS_COUNT 10
precision mediump int;
			
in vec4 vPosition;
in vec3 vNormal;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform int lightsCount;
uniform vec4 lPosition[MAX_LIGHTS_COUNT];

out vec4 positionCam;
out vec4 normalCam;
out vec4 lightPosCam[MAX_LIGHTS_COUNT];

void main()
{
    mat4 modelViewMatrix = viewMatrix * modelMatrix;
    mat4 normalMatrix = inverse(transpose(modelViewMatrix));
    mat4 invViewMatrix = inverse(transpose(viewMatrix));

    positionCam = modelViewMatrix * vPosition;
    normalCam = normalMatrix * vec4(vNormal, 0.0);
    for (int i = 0; i < lightsCount; i++) {
        if (lPosition[i].w == 0.0) {
            lightPosCam[i] = invViewMatrix * lPosition[i];
            lightPosCam[i].w = 0.0;
        } else {
            lightPosCam[i] = viewMatrix * lPosition[i];
        }
    }

    gl_Position = projectionMatrix * positionCam;
}