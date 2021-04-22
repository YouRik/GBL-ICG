#version 300 es
precision mediump float;
in vec4 vfColor;
out vec4 fColor;

void main()
{
    fColor = vfColor;
}