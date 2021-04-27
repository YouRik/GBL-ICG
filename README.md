# A proof-of-concept game-based learning approach to teaching interactive computer graphics.

## Requirements

- Node.js to start the server

- Web browser to play the game

## Instructions
- Install dependencies:  
`npm install`

- Generate documentation:  
`bash ./generate_docs`

- Start web server:  
`npm start`

## Notes
- Physics meshes must be convex, faces must have CCW (right hand rule) winding order and coplanar faces must not exist (must be merged into one).
- Graphical mesh faces must have CCW (right hand rule) winding order (for back-face culling) and must be triangulated (coplanar faces may exist).
- Blender .ply export settings to use: Format: ASCII, Forward: -Z, Up: Y, Geometry: Normals