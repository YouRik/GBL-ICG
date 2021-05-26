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
    // TASK: Use the transformation matrices provided to the shader to transform
    //       the vertex positions to clip space
    gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
}