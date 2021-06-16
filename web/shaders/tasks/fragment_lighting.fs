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
        // Directed light, position represents the light direction coming from
        // the light source in world space
        L = normalize(-lightPosCam[lIndex].xyz);
    } else {
        // Point light
        // TASK: Calculate L for point lights
        

        // TASK: Calculate the light attenuation factor fAtt
        
        

    }
    // TASK: Calculate the reflection vector R
    
    
    // TASK: Return the diffuse and specular part of the Phong lighting equation
    
    

    return vec3(0, 0, 0);
}

void main()
{
    // TASK: Calculate the vectors N and V
    
    

    // TASK Set ambient component of color/intensity vector I
    
    for (int i = 0; i < lightsCount; i++) {
        // TASK: for each light source, add the calculated intensity
        
    }

    // TASK: Set RGB components to those of newly calculated intensity
    fColor = vec4(ka.rgb, 1.0);
}