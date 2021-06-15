#version 300 es
precision mediump float;
out vec4 fColor;

void main()
{
    // gl_FragDepth = gl_FragCoord.z;
    fColor = vec4(gl_FragCoord.z, 0.0, 0.0, 1.0);
}