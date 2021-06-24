#version 300 es
precision mediump float;
out vec4 fColor;

void main()
{
    // TASK4.1: Set the depth such that the whole shadow map is in shadow
    // TASK4.2: Set the depth to the fragment's z coordinate
    float depth = 0.999;
    gl_FragDepth = depth;
    fColor = vec4(depth, 0.0, 0.0, 1.0);
}