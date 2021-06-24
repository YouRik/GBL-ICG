#version 300 es
#define MAX_LIGHTS_COUNT 20
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
    // Do perspective divide in case a perspective projection was used
    vec3 projected = positionLightSpace.xyz / positionLightSpace.w;
    // Range correction to [0; 1]
    projected = (projected + 1.0) / 2.0;
    
    // 0.0 represents not in shadow. A higher value up to 1.0 darkens the shadow
    float shadow = 0.0;
    // Check if fragment is in shadow
    if (projected.x > 1.0 || projected.x < 0.0
        || projected.y > 1.0 || projected.y < 0.0 || projected.z > 1.0) {
        // Fragment is outside of rendered shadow map, not in shadow
        // TASK4.2: set shadow value accordingly
        
    } else {
        // TASK4.2: Read closest depth from shadow map. It is the first
        //          component of the vector read from the shadow/depth map
        
        // TASK4.2: Read light space projected depth of fragment
        
        // TASK4.2: Set shadow value depending on if the fragment is in shadow
        
    }
    return shadow;
}

vec3 calculateIntensity(int lIndex, vec3 N, vec3 V) {
    float fAtt = 1.0;
    vec3 L;
    float shadowFactor = 0.0;
    
    if (lightPosCam[lIndex].w == 0.0) {
        // Directed light, position represents the light direction coming from
        // the light source in world space
        L = normalize(-lightPosCam[lIndex].xyz);
        // TASK4.2: Calculate shadow factor with above shadow() function
        
    } else {
        // Point light
        // TASK3.4: Calculate L for point lights
        

        // TASK3.4: Calculate the light attenuation factor fAtt
        


    }
    // TASK3.4: Calculate the reflection vector R
    
    
    // TASK3.4: Return the diffuse and specular part of the Phong lighting equation
    // TASK4.2: Multiply shadowFactor to the intensity equation
    return vec3(0.0, 0.0, 0.0);
}

void main()
{
    // TASK3.4: Calculate the vectors N and V
    
    

    // TASK3.4 Calculate ambient part of color/intensity vector I
    vec3 I = vec3(0.0, 0.0, 0.0);
    for (int i = 0; i < lightsCount; i++) {
        // TASK3.4: for each light source, add the calculated intensity
        
    }

    // TASK3.4: Set RGB components to those of newly calculated intensity
    fColor = vec4(ka.rgb, 1.0);
}