/*
  Screen class
  (c) Víctor "Hectobreak" Franco 2023, under MIT License
 */

class Screen {
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
		this.texcoordLocation = this.context.getAttribLocation(this.program, "a_texcoord");

		// lookup uniforms
		this.matrixLocation = this.context.getUniformLocation(this.program, "u_matrix");
		this.textureMatrixLocation = this.context.getUniformLocation(this.program, "u_textureMatrix");
		this.textureLocation = this.context.getUniformLocation(this.program, "u_texture");

		// Create a buffer.
		this.quad_position_buffer = this.context.createBuffer();
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
		let srcX = texture_info.low_x;
		let srcY = texture_info.low_y;
		let srcWidth = texture_info.sprite_width;
		let srcHeight = texture_info.sprite_height;
		let dstWidth = texture_info.sprite_width;
		let dstHeight = texture_info.sprite_height;
		let texWidth = texture_info.width;
		let texHeight = texture_info.height;
		let tex = texture_info.texture;
		let dstX = 0;
		let dstY = 0;

		this.context.bindTexture(this.context.TEXTURE_2D, tex);

		// Tell WebGL to use our shader program pair
		this.context.useProgram(this.program);

		// Setup the attributes to pull data from our buffers
		this.context.bindBuffer(this.context.ARRAY_BUFFER, this.quad_position_buffer);
		this.context.enableVertexAttribArray(this.positionLocation);
		this.context.vertexAttribPointer(this.positionLocation, 2, this.context.FLOAT, false, 0, 0);
		this.context.bindBuffer(this.context.ARRAY_BUFFER, this.quad_texcoord_buffer);
		this.context.enableVertexAttribArray(this.texcoordLocation);
		this.context.vertexAttribPointer(this.texcoordLocation, 2, this.context.FLOAT, false, 0, 0);

		// this matrix will convert from pixels to clip space
		let transform = this.camera.camera_transform;

		// this matrix will translate and scale our quad
		transform = transform.mult(new LinearTransform(texture_info.model_matrix));

		// Set the matrix.
		this.context.uniformMatrix4fv(this.matrixLocation, false, new Float32Array(transform.matrix));

		// Set the texture matrix.
		this.context.uniformMatrix3fv(this.textureMatrixLocation, false,
			new Float32Array(texture_info.texture_matrix));

		// Tell the shader to get the texture from texture unit 0
		this.context.uniform1i(this.textureLocation, 0);

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
