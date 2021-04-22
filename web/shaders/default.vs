#version 300 es
in vec4 vPosition;
in vec4 vColor;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
out vec4 vfColor;

void main()
{
    vfColor = vColor;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vPosition;
}