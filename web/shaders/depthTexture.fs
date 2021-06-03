#version 300 es
precision mediump float;
in vec2 fTexCoord;
out vec4 fColor;
uniform sampler2D uSampler;

void main()
{
    float depthValue = texture(uSampler, fTexCoord).r;
    fColor = vec4(vec3(depthValue), 1.0);
}