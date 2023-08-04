/*
  Fragment Shader class
  (c) Víctor "Hectobreak" Franco 2023, under MIT License
 */

const __DEFAULT_FRAGMENT_SHADER__ = `
precision mediump float;
 
varying vec2 v_texcoord;
varying vec4 world_pos, world_normal;

uniform float Ka;   // Ambient reflection coefficient
uniform float Kd;   // Diffuse reflection coefficient
uniform float Ks;   // Specular reflection coefficient
uniform float shininessVal; // Shininess

// Material color
uniform vec3 ambientColor;   // Ambient  color
uniform sampler2D u_texture; // Diffuse  color 1
uniform vec3 diffuseColor;   // Diffuse  color 2
uniform vec3 specularColor;  // Specular color

uniform vec3 lightPos;       // Light position

uniform mat3 u_textureMatrix;
 
void main() {
   vec3 vt_corrected = u_textureMatrix * vec3(v_texcoord.x, v_texcoord.y, 1);
   vec2 tmp = vec2( fract(vt_corrected.x / vt_corrected.z), fract(vt_corrected.y / vt_corrected.z) );
   
   vec3 N = normalize(vec3(world_normal));
   vec3 L = normalize(lightPos - vec3(world_pos));
   float lambertian = max(dot(N, L), 0.0);
   
   float specular = 0.0;
   if(lambertian > 0.0) {
      vec3 R = reflect(-L, N);
      vec3 V = normalize(-vec3(world_pos));
      // Compute the specular term
      float specAngle = max(dot(R, V), 0.0);
      specular = pow(specAngle, shininessVal);
   }
   
   vec4 color = vec4(Ka * ambientColor + Kd * lambertian * diffuseColor, 1.0) * texture2D(u_texture, tmp);
   
   gl_FragColor = color + vec4(Ks * specular * specularColor, color.w);
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