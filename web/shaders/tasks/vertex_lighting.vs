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
    // TASK: Calculate normalMatrix, a variation of the modelViewMatrix used
    //       for normals
    
    // Variation of the viewMatrix used for normals
    mat4 invViewMatrix = inverse(transpose(viewMatrix));

    vec4 position = modelViewMatrix * vPosition;
    // TASK: Transform normals to world space with the normalMatrix
    

    float fAtt = 1.0;
    vec3 L;

    // TASK: Calculate the vector L. Note the two cases of directed light and
    //       point light
    if (lPosition[0].w == 0.0) {
        // Directed light, position represents the vector light direction from
        // the light source in world coordinates
        vec4 lightDir = invViewMatrix * lPosition[0];
        L = normalize(-lightDir.xyz);
    } else {
        // Point light
        // TASK: Calculate the vector L in the case of a point light
        
        

        // TASK: Calculate the attenuation factor fAtt
        
        
    }
    
    // TASK: Calculate the vectors N and V
    
    
    // TASK: Calculate the vector R
    

    // TASK: Calculate the light/color intensity with Phong's lighting equation
    vec3 I = vec3(0.73, 0.52, 0.3);
    vfColor = vec4(I.rgb, 1.0);
    
    gl_Position = projectionMatrix * position;
}