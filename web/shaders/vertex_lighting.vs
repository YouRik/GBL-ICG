#version 300 es
			
in vec4 vPosition;
in vec3 vNormal;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform vec4 lPosition[1];

uniform vec3 Ia;
uniform vec3 Id[1];
uniform vec3 Is[1];
uniform vec3 ka;
uniform vec3 kd;
uniform vec3 ks;
uniform float specExp;

uniform float c1[1];
uniform float c2[1];
uniform float c3[1];

out vec4 vfColor;

void main()
{
    mat4 modelViewMatrix = viewMatrix * modelMatrix;
    mat4 normalMatrix = inverse(transpose(modelViewMatrix));
    mat4 invViewMatrix = inverse(transpose(viewMatrix));

    vec4 position = modelViewMatrix * vPosition;
    vec4 normal = normalMatrix * vec4(normalize(vNormal), 0.0);

    float fAtt = 1.0;
    vec3 L;
    if (lPosition[0].w == 0.0) {
        // Directed light, position represents the light direction
        vec4 lightDir = invViewMatrix * lPosition[0];
        L = normalize(-lightDir.xyz);
    } else {
        // Point light
        vec4 lightPos = viewMatrix * lPosition[0];
        L = normalize((lightPos - position).xyz);

        float d = distance(lightPos, position);
        fAtt = min(1.0/(c1[0] + c2[0] * d + c3[0] * pow(d, 2.0)), 1.0);
    }
    
    vec3 N = normalize(normal.xyz);
    vec3 V = normalize((-position).xyz);
    vec3 R = normalize(reflect(-L, N));

    vec3 I 	= Ia * ka
        + fAtt * (Id[0] * kd * max(dot(N, L), 0.0)
        + Is[0] * ks * pow(max(dot(R, V), 0.0), specExp));
    vfColor = vec4(I.xyz, 1.0);
    
    gl_Position = projectionMatrix * position;
}