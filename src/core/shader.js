/*
  Shader Class
  (c) Víctor "Hectobreak" Franco 2023, under MIT License
 */

class Shader {
    #shader;
    #gl;
    #def_shader;
    #type;
    constructor(gl, type, code, preload=false) {
        this.#gl = gl;
        this.#shader = code;
        this.#def_shader = null;
        this.#type = type;

        if(preload) this.shader();
    }

    get shader(){
        if(this.#def_shader !== null) return this.#def_shader;
        // Create the shader object
        const shader = this.#gl.createShader(this.#type);

        // Load the shader source
        this.#gl.shaderSource(shader, this.#shader);

        // Compile the shader
        this.#gl.compileShader(shader);

        // Check the compile status
        const compiled = this.#gl.getShaderParameter(shader, this.#gl.COMPILE_STATUS);
        if (!compiled) {
            const lastError = this.#gl.getShaderInfoLog(shader);
            this.#gl.deleteShader(shader);
            throw new Error('*** Error compiling shader \'' + shader + '\':' + lastError + `\n` + this.#shader.split('\n').map((l,i) => `${i + 1}: ${l}`).join('\n'));
        }

        this.#def_shader = shader;
        return shader;
    }

}