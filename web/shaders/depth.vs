#version 300 es
in vec4 vPosition;

uniform mat4 modelMatrix;
uniform mat4 lightSpaceMatrix;

void main()
{
    gl_Position = lightSpaceMatrix * modelMatrix * vPosition;
}