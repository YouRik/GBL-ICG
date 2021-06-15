#version 300 es
#define MAX_LIGHTS_COUNT 10
precision mediump float;

in vec4 positionCam;
in vec4 normalCam;
in vec4 lightPosCam[MAX_LIGHTS_COUNT];
in vec4 positionLightSpace;

uniform int lightsCount;

uniform vec3 Ia;
uniform vec3 Id[MAX_LIGHTS_COUNT];
uniform vec3 Is[MAX_LIGHTS_COUNT];
uniform vec3 ka;
uniform vec3 kd;
uniform vec3 ks;
uniform float specExp;

uniform sampler2D shadowMap;

uniform float c1[MAX_LIGHTS_COUNT];
uniform float c2[MAX_LIGHTS_COUNT];
uniform float c3[MAX_LIGHTS_COUNT];

out vec4 fColor;

float shadow(int lIndex) {
    // Set bias based on angle between fragment and light direction
    // Do perspective divide in case a perspective projection was used
    vec3 projected = positionLightSpace.xyz / positionLightSpace.w;
    // Range correction to [0; 1]
    projected = (projected + 1.0) / 2.0;
    // Check if fragment is in shadow
    float shadow = 0.0;
    if (projected.x > 1.0 || projected.x < 0.0
        || projected.y > 1.0 || projected.y < 0.0 || projected.z > 1.0) {
        shadow = 1.0;
    } else {
        float closest = texture(shadowMap, projected.xy).r;
        float current = projected.z;
        shadow = closest > current ? 0.0 : 1.0;
    }
    return shadow;
}

vec3 calculateIntensity(int lIndex, vec3 N, vec3 V) {
    float fAtt = 1.0;
    vec3 L;
    float shadowFactor = 0.0;

    if (lightPosCam[lIndex].w == 0.0) {
        // Directed light, position represents the light direction
        L = normalize(-lightPosCam[lIndex].xyz);
        shadowFactor = 1.0 - shadow(lIndex);
    } else {
        // Point light
        L = normalize((lightPosCam[lIndex] - positionCam).xyz);

        float d = distance(lightPosCam[lIndex], positionCam);
        fAtt = min(1.0/(c1[lIndex] + c2[lIndex] * d + c3[lIndex] * pow(d, 2.0)),
            1.0);
    }
    vec3 R = reflect(-L, N);

    return shadowFactor * fAtt *
        (Id[lIndex] * kd * max(dot(N, L), 0.0)
        + Is[lIndex] * ks * pow(max(dot(R, V), 0.0), specExp));
}

void main()
{
    vec3 N = normalize(normalCam.xyz);
    vec3 V = normalize((-positionCam).xyz);

    vec3 I = Ia * ka;
    for (int i = 0; i < lightsCount; i++) {
        I += calculateIntensity(i, N, V);
    }

    fColor = vec4(I.rgb, 1.0);
}