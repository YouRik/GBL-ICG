#version 300 es
#define MAX_LIGHTS_COUNT 10
precision mediump int;
			
in vec4 vPosition;
in vec3 vNormal;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform int lightsCount;
uniform vec3 lPosition[MAX_LIGHTS_COUNT];

out vec4 positionCam;
out vec4 normalCam;
out vec4 lightPosCam[MAX_LIGHTS_COUNT];

void main()
{
    mat4 modelViewMatrix = viewMatrix * modelMatrix;
    mat4 normalMatrix = inverse(transpose(modelViewMatrix));

    positionCam = modelViewMatrix * vPosition;
    normalCam = normalMatrix * vec4(vNormal, 0.0);
    for (int i = 0; i < lightsCount; i++) {
        lightPosCam[i] = viewMatrix * vec4(lPosition[i], 1.0);
    }

    gl_Position = projectionMatrix * positionCam;
}