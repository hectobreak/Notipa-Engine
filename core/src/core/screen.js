/*
  Screen class
  (c) Víctor "Hectobreak" Franco 2023, under MIT License
 */

class Screen {
	#light_pos;

	constructor(canvas = null){
		this.canvas = canvas;
		this.context = canvas.getContext("webgl");
		this.vs = new VertexShader(this.context);
		this.fs = new FragmentShader(this.context);
		if(!this.context){
			throw new Error("WebGL Not working");
		}

		this.program = this.context.createProgram();
		this.context.attachShader(this.program, this.vs.shader);
		this.context.attachShader(this.program, this.fs.shader);
		this.context.linkProgram(this.program);
		this.context.enable(this.context.DEPTH_TEST);

		// Check the link status
		const linked = this.context.getProgramParameter(this.program, this.context.LINK_STATUS);
		if (!linked) {
			const lastError = this.context.getProgramInfoLog(this.program);
			this.context.deleteProgram(this.program);
			throw new Error('Error in program linking:' + lastError);
		}

		this.positionLocation = this.context.getAttribLocation(this.program, "a_position");
		this.normalsLocation = this.context.getAttribLocation(this.program, "a_normal");
		this.texcoordLocation = this.context.getAttribLocation(this.program, "a_texcoord");

		// matrices lookup uniforms
		this.matrixLocationCam = this.context.getUniformLocation(this.program, "u_cameraMatrix");
		this.matrixLocationObj = this.context.getUniformLocation(this.program, "u_modelMatrix");
		this.matrixLocationObjInv = this.context.getUniformLocation(this.program, "u_modelMatrixInverse");
		this.textureMatrixLocation = this.context.getUniformLocation(this.program, "u_textureMatrix");

		// material coefficient lookup uniforms
		this.ambientReflectionLocation = this.context.getUniformLocation(this.program, "Ka");
		this.diffuseReflectionLocation = this.context.getUniformLocation(this.program, "Kd");
		this.specularReflectionLocation = this.context.getUniformLocation(this.program, "Ks");
		this.shininessLocation = this.context.getUniformLocation(this.program, "shininessVal");

		// material color lookup uniforms
		this.textureLocation = this.context.getUniformLocation(this.program, "u_texture");
		this.ambientColorLocation = this.context.getUniformLocation(this.program, "ambientColor");
		this.diffuseColorLocation = this.context.getUniformLocation(this.program, "diffuseColor");
		this.specularColorLocation = this.context.getUniformLocation(this.program, "specularColor");

		this.lightPositionLocation = this.context.getUniformLocation(this.program, "lightPos");

		// Create a buffer.
		this.quad_position_buffer = this.context.createBuffer();
		this.quad_normals_buffer = this.context.createBuffer();
		this.quad_texcoord_buffer = this.context.createBuffer();

		const quad_positions = [
			0, 0,
			0, 1,
			1, 0,
			1, 0,
			0, 1,
			1, 1,
		];
		this.context.bindBuffer(this.context.ARRAY_BUFFER, this.quad_position_buffer);
		this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(quad_positions), this.context.STATIC_DRAW);

		const quad_normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
		];
		this.context.bindBuffer(this.context.ARRAY_BUFFER, this.quad_normals_buffer);
		this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(quad_normals), this.context.STATIC_DRAW);

		const quad_texcoords = [
			0, 0,
			0, 1,
			1, 0,
			1, 0,
			0, 1,
			1, 1,
		];
		this.context.bindBuffer(this.context.ARRAY_BUFFER, this.quad_texcoord_buffer);
		this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(quad_texcoords), this.context.STATIC_DRAW);

		this.camera = new Camera(CameraTypes.Orthographic);

		this.set_light_pos(new Vector3D(400, 300, -100000));
	}

	set_light_pos(pos){
		assert(pos instanceof Vector3D, "The position must be a 3D Vector!");
		this.#light_pos = pos;
	}
	
	clear(){
		this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
	}

	enable_blending(){
		this.context.blendFunc(this.context.ONE, this.context.ONE_MINUS_SRC_ALPHA);
		this.context.enable(this.context.BLEND);
		this.context.depthMask(false);
	}

	disable_blending(){
		this.context.disable(this.context.BLEND);
		this.context.depthMask(true);
	}

	clear_depth(clamp = 1){
		this.context.clearDepth(clamp);
	}

	drawTextureInfo(texture_info) {
		this.context.uniform3f(this.lightPositionLocation, this.#light_pos.x, this.#light_pos.y, this.#light_pos.z);

		let srcX = texture_info.low_x;
		let srcY = texture_info.low_y;
		let srcWidth = texture_info.sprite_width;
		let srcHeight = texture_info.sprite_height;
		let dstWidth = texture_info.sprite_width;
		let dstHeight = texture_info.sprite_height;
		let texWidth = texture_info.width;
		let texHeight = texture_info.height;
		let tex = texture_info.texture;
		let ka = texture_info.ka;
		let kd = texture_info.kd;
		let ks = texture_info.ks;
		let shiny = texture_info.shiny;
		let ambient = texture_info.ambient;
		let diffuse = texture_info.diffuse;
		let specular = texture_info.specular;
		let dstX = 0;
		let dstY = 0;

		this.context.bindTexture(this.context.TEXTURE_2D, tex);

		// Tell WebGL to use our shader program pair
		this.context.useProgram(this.program);

		// Setup the attributes to pull data from our buffers
		this.context.bindBuffer(this.context.ARRAY_BUFFER, this.quad_position_buffer);
		this.context.enableVertexAttribArray(this.positionLocation);
		this.context.vertexAttribPointer(this.positionLocation, 2, this.context.FLOAT, false, 0, 0);
		this.context.bindBuffer(this.context.ARRAY_BUFFER, this.quad_normals_buffer);
		this.context.enableVertexAttribArray(this.normalsLocation);
		this.context.vertexAttribPointer(this.normalsLocation, 3, this.context.FLOAT, false, 0, 0);
		this.context.bindBuffer(this.context.ARRAY_BUFFER, this.quad_texcoord_buffer);
		this.context.enableVertexAttribArray(this.texcoordLocation);
		this.context.vertexAttribPointer(this.texcoordLocation, 2, this.context.FLOAT, false, 0, 0);

		// this matrix will convert from pixels to clip space
		let transform = this.camera.camera_transform;
		this.context.uniformMatrix4fv(this.matrixLocationCam, false, new Float32Array(transform.matrix));

		// this matrix will translate and scale our object
		transform = new LinearTransform(texture_info.model_matrix);
		this.context.uniformMatrix4fv(this.matrixLocationObj, false, new Float32Array(transform.matrix));

		if(kd > 0 || ks > 0){
			transform = transform.inverse;
			this.context.uniformMatrix4fv(this.matrixLocationObjInv, false, new Float32Array(transform.matrix));
		}

		// Set the texture matrix.
		this.context.uniformMatrix3fv(this.textureMatrixLocation, false,
			new Float32Array(texture_info.texture_matrix));

		// Material uniforms
		this.context.uniform1i(this.textureLocation, 0);
		this.context.uniform1f(this.ambientReflectionLocation, ka);
		this.context.uniform1f(this.diffuseReflectionLocation, kd);
		this.context.uniform1f(this.specularReflectionLocation, ks);
		this.context.uniform1f(this.shininessLocation, shiny);
		this.context.uniform3f(this.ambientColorLocation, ambient.x, ambient.y, ambient.z);
		this.context.uniform3f(this.diffuseColorLocation, diffuse.x, diffuse.y, diffuse.z);
		this.context.uniform3f(this.specularColorLocation, specular.x, specular.y, specular.z);

		// draw the quad (2 triangles, 6 vertices)
		this.context.drawArrays(this.context.TRIANGLES, 0, 6);
	}

	drawImage(image_object){
		let t_info = image_object.texture_info;
		if(t_info === null){
			image_object.loadImageAndCreateTextureInfo(this.context);
			t_info = image_object.texture_info;
		}
		if(t_info !== null) {
			this.drawTextureInfo(t_info);
		}

	}

	drawShape(shape_object){
		throw new Error("Not implemented yet!");
	}
}
