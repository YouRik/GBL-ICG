#version 300 es
#define MAX_LIGHTS_COUNT 20
precision mediump float;

in vec4 positionCam;
in vec4 normalCam;
in vec4 lightPosCam[MAX_LIGHTS_COUNT];

uniform int lightsCount;

uniform vec3 Ia;
uniform vec3 Id[MAX_LIGHTS_COUNT];
uniform vec3 Is[MAX_LIGHTS_COUNT];
uniform vec3 ka;
uniform vec3 kd;
uniform vec3 ks;
uniform float specExp;

uniform float c1[MAX_LIGHTS_COUNT];
uniform float c2[MAX_LIGHTS_COUNT];
uniform float c3[MAX_LIGHTS_COUNT];

out vec4 fColor;

vec3 calculateIntensity(int lIndex, vec3 N, vec3 V) {
    float fAtt = 1.0;
    vec3 L;
    
    if (lightPosCam[lIndex].w == 0.0) {
        // Directed light, position represents the light direction
        L = normalize(-lightPosCam[lIndex].xyz);
    } else {
        // Point light
        L = normalize((lightPosCam[lIndex] - positionCam).xyz);

        float d = distance(lightPosCam[lIndex], positionCam);
        fAtt = min(1.0/(c1[lIndex] + c2[lIndex] * d + c3[lIndex] * pow(d, 2.0)),
            1.0);
    }
    vec3 R = reflect(-L, N);
    
    return fAtt *
            (Id[lIndex] * kd * max(dot(N, L), 0.0)
            + Is[lIndex] * ks * pow(max(dot(R, V), 0.0), specExp));
}

// TODO: TASK notes for lighting3 and lighting4

void main()
{
    vec3 N = normalize(normalCam.xyz);
    vec3 V = normalize((-positionCam).xyz);

    vec3 I = Ia * ka;
    for (int i = 0; i < lightsCount; i++) {
        I += calculateIntensity(i, N, V);
    }

    fColor = vec4(ka, 1.0);
}