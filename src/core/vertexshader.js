/*
  Vertex Shader Class
  (c) Víctor "Hectobreak" Franco 2023, under MIT License
 */

const __DEFAULT_VERTEX_SHADER__ = `
attribute vec4 a_position;
attribute vec2 a_texcoord;
 
uniform mat4 u_matrix;
 
varying vec2 v_texcoord;
 
void main() {
   gl_Position = u_matrix * a_position;
   v_texcoord = a_texcoord;
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