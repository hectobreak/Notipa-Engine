/*
  Vertex Shader Class
  (c) Víctor "Hectobreak" Franco 2023, under MIT License
 */

const __DEFAULT_VERTEX_SHADER__ = `
attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec2 a_texcoord;
 
uniform mat4 u_cameraMatrix, u_modelMatrix, u_modelMatrixInverse;
 
varying vec2 v_texcoord;
varying vec4 world_pos;
varying vec4 world_normal;
 
void main() {
   world_pos = u_modelMatrix * a_position;
   gl_Position = u_cameraMatrix * world_pos;
   v_texcoord = a_texcoord;
   world_normal = -vec4(normalize(vec3(vec4(a_normal, 0.0) * u_modelMatrixInverse)), 0.0);
}
`;

class VertexShader {
    #shader;
    constructor(gl, preload=false, code=__DEFAULT_VERTEX_SHADER__) {
        this.#shader = new Shader(gl, gl.VERTEX_SHADER, code, preload);
    }

    get shader(){
        return this.#shader.shader;
    }
}