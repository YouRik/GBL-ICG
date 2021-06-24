#version 300 es
in vec4 vPosition;

uniform mat4 modelMatrix;
uniform mat4 lightSpaceMatrix;

void main()
{
    // TASK4.1: Transform the vertex position to light space
    gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
}