#version 300 es
			
in vec4 vPosition;
in vec3 vNormal;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform vec3 lPosition[1];

uniform vec3 Ia;
uniform vec3 Id[1];
uniform vec3 Is[1];
uniform vec3 ka;
uniform vec3 kd;
uniform vec3 ks;
uniform float specExp;

const float c1 = 1.0;
const float c2 = 0.0005;
const float c3 = 0.000003;

out vec4 vfColor;

void main()
{
    // TODO: put TASK TODOs here for lighting1 and lighting2
    mat4 modelViewMatrix = viewMatrix * modelMatrix;
    mat4 normalMatrix = inverse(transpose(modelViewMatrix));

    vec4 position = modelViewMatrix * vPosition;
    vec4 normal = normalMatrix * vec4(normalize(vNormal), 0.0);
    vec4 lightPos = viewMatrix * vec4(lPosition[0], 1.0);
    
    vec3 N = normalize(normal.xyz);
    vec3 L = normalize((lightPos - position).xyz);
    vec3 V = normalize((-position).xyz);
    vec3 R = normalize(reflect(-L, N));

    float d = distance(lightPos, position);
    float fAtt = min(1.0/(c1 + c2 * d + c3 * pow(d, 2.0)), 1.0);

    vec3 I 	= Ia * ka + fAtt * (Id[0] * kd * max(dot(N, L), 0.0));
        // + Is[0] * ks * pow(max(dot(R, V), 0.0), specExp));
    vfColor = vec4(I.rgb, 1.0);
    
    gl_Position = projectionMatrix * position;
}