/*
  Fragment Shader class
  (c) Víctor "Hectobreak" Franco 2023, under MIT License
 */

const __DEFAULT_FRAGMENT_SHADER__ = `
precision mediump float;
 
varying vec2 v_texcoord;

uniform mat3 u_textureMatrix;
uniform sampler2D u_texture;
 
void main() {
   vec3 vt_corrected = u_textureMatrix * vec3(v_texcoord.x, v_texcoord.y, 1);
   vec2 tmp = vec2( fract(vt_corrected.x / vt_corrected.z), fract(vt_corrected.y / vt_corrected.z) );
   gl_FragColor = texture2D(u_texture, tmp);
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