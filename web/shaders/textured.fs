#version 300 es
precision mediump float;
in vec4 vfColor;
in vec2 fTexCoord;
out vec4 fColor;
uniform sampler2D uSampler;

void main()
{
    fColor = texture(uSampler, fTexCoord);
}