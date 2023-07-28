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
		this.positionBuffer = this.context.createBuffer();

		this.camera = new Camera(CameraTypes.Orthographic);
	}
	
	clear(){
		this.context.clear(this.context.COLOR_BUFFER_BIT);
		// this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	drawTextureInfo(texture_info) {
		console.log(texture_info);
		let srcX = texture_info.low_x;
		let srcY = texture_info.low_y;
		let srcWidth = texture_info.sprite_width;
		let srcHeight = texture_info.sprite_height;
		let dstWidth = texture_info.sprite_width;
		let dstHeight = texture_info.sprite_height;
		let dstX = 0;
		let dstY = 0;

		this.context.bindTexture(this.context.TEXTURE_2D, tex);

		// Tell WebGL to use our shader program pair
		this.context.useProgram(this.program);

		// Setup the attributes to pull data from our buffers
		this.context.bindBuffer(this.context.ARRAY_BUFFER, this.positionBuffer);
		this.context.enableVertexAttribArray(this.positionLocation);
		this.context.vertexAttribPointer(this.positionLocation, 2, this.context.FLOAT, false, 0, 0);
		this.context.bindBuffer(this.context.ARRAY_BUFFER, texcoordBuffer);
		this.context.enableVertexAttribArray(this.texcoordLocation);
		this.context.vertexAttribPointer(this.texcoordLocation, 2, this.context.FLOAT, false, 0, 0);

		// this matrix will convert from pixels to clip space
		let transform = this.camera.camera_transform;

		// this matrix will translate and scale our quad
		transform = transform.mult(new LinearTransform(texture_info.model_matrix));

		// Set the matrix.
		this.context.uniformMatrix4fv(this.matrixLocation, false, new Float32Array(transform.matrix));

		// Because texture coordinates go from 0 to 1
		// and because our texture coordinates are already a unit quad
		// we can select an area of the texture by scaling the unit quad
		// down
		let texMatrix = m4.translation(srcX / texWidth, srcY / texHeight, 0);
		texMatrix = m4.scale(texMatrix, srcWidth / texWidth, srcHeight / texHeight, 1);

		// Set the texture matrix.
		this.context.uniformMatrix4fv(this.textureMatrixLocation, false, texMatrix);

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
