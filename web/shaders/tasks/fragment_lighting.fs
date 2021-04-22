#version 300 es
precision mediump float;

in vec4 positionCam;
in vec4 normalCam;
in vec4 lightPosCam;

uniform vec3 Ia;
uniform vec3 Id;
uniform vec3 Is;
uniform vec3 ka;
uniform vec3 kd; 
uniform vec3 ks;
uniform float specExp;

const float c1 = 1.0;
const float c2 = 0.0005;
const float c3 = 0.000003;

out vec4 fColor;

void main()
{
    vec3 N = normalize(normalCam.xyz);
    vec3 L = normalize((lightPosCam - positionCam).xyz);
    vec3 V = normalize((-positionCam).xyz);
    vec3 R = reflect(-L, N);

    float d = distance(lightPosCam, positionCam);
    float fAtt = 1.0;
    // float fAtt = min(1.0/(c1 + c2 * d + c3 * pow(d, 2.0)), 1.0);

    vec3 I 	= Ia * ka
        + fAtt * (Id * kd * max(dot(N, L), 0.0)
        + Is * ks * pow(max(dot(R, V), 0.0), specExp));
    fColor = vec4(I.rgb, 1.0);
}