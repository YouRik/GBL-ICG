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
    // TASK3.2: Calculate normalMatrix, a variation of the modelViewMatrix used
    //          for normals
    
    // TASK3.2: Calculate variation of the viewMatrix used for direction vectors

    vec4 position = modelViewMatrix * vPosition;
    // TASK3.2: Transform normals to world space with the normalMatrix
    

    float fAtt = 1.0;
    vec3 L;

    // TASK3.2: Calculate the vector L. Note the two cases of directed light and
    //          point light. Only the first case is relevant for this task
    if (lPosition[0].w == 0.0) {
        // Directed light, position represents the vector light direction from
        // the light source in world coordinates
        // TASK3.2: Calculate the light direction in view space
        
        // TASK3.2: Calculate the vector L in the case of a point light
        
    } else {
        // Point light
    }
    
    // TASK3.2: Calculate the vectors N and V
    
    
    // TASK3.3: Calculate the vector R
    

    // TASK3.1: Calculate the ambient intensity with Phong's lighting equation
    // TASK3.2: Calculate the diffuse intensity with Phong's lighting equation
    // TASK3.3: Calculate the specular intensity with Phong's lighting equation
    vec3 I = vec3(0.11, 0.55, 0.35);
    vfColor = vec4(I.rgb, 1.0);
    
    gl_Position = projectionMatrix * position;
}