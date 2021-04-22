#version 300 es
			
in vec4 vPosition;
in vec3 vNormal;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform vec3 lPosition;

out vec4 positionCam;
out vec4 normalCam;
out vec4 lightPosCam;

void main()
{
    mat4 modelViewMatrix = viewMatrix * modelMatrix;
    mat4 normalMatrix = inverse(transpose(modelViewMatrix));

    positionCam = modelViewMatrix * vPosition;
    normalCam = normalMatrix * vec4(vNormal, 0.0);
    lightPosCam = viewMatrix * vec4(lPosition, 1.0);
                    
    gl_Position = projectionMatrix * positionCam;
}