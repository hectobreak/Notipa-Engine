/*
  Fragment Shader class
  (c) Víctor "Hectobreak" Franco 2023, under MIT License
 */

const __DEFAULT_FRAGMENT_SHADER__ = `
precision mediump float;
 
varying vec2 v_texcoord;
 
uniform sampler2D u_texture;
 
void main() {
   gl_FragColor = texture2D(u_texture, v_texcoord);
}
`;

class FragmentShader {
    #shader;
    constructor(gl, preload=false, code=__DEFAULT_FRAGMENT_SHADER__) {
        this.#shader = new Shader(gl, gl.FRAGMENT_SHADER, code, preload);
    }

    get shader(){
        return this.#shader.shader;
    }
}