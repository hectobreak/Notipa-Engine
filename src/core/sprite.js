/*
  Sprite class
  (c) Víctor "Hectobreak" Franco 2023, under MIT License
 */

class Sprite {
	#texture_info = null;
	constructor(image= null,
				origin= new Vector3D(),
				position= new Vector3D(),
				scale= new Vector3D(1, 1, 1),
				parent_object = null){
		new Component(this, position, scale, parent_object);
		
		assert(image === null || typeof image === 'string' || image instanceof Image,
			"The image must be a string (the path to the image) or an Image object!");
		assert(origin instanceof Vector3D, "The position must be a Vector3D object!");

		this.deep_copy = () => {
			return new Image(image, origin, position, scale, parent_object);
		}

		let sprite_obj = this;
		this.has_loaded = false;
		this.dimensions = new Vector3D();
		this.image_index = 0;
		this.num_rows = 1;
		this.num_cols = 1;
		if(typeof image === 'string') {
			this.img = new Image;
			this.img.onload = function(){
				sprite_obj.dimensions.x = this.naturalWidth;
				sprite_obj.dimensions.y = this.naturalHeight;
				sprite_obj.has_loaded = true;
			}
			this.img.crossOrigin = "anonymous";
			this.img.src = image;
		} else if(image instanceof Image) {
			this.img = image;
			this.img.crossOrigin = "anonymous";
			this.img.onload = function(){
				sprite_obj.dimensions.x = this.naturalWidth;
				sprite_obj.dimensions.y = this.naturalHeight;
				sprite_obj.has_loaded = true;
			}
			if(image.complete){
				this.dimensions.x = this.img.naturalWidth;
				this.dimensions.y = this.img.naturalHeight;
				this.has_loaded = true;
			}
		}
		this.origin = origin;
		this.loading_texture_info = false;
	}

	loadImageAndCreateTextureInfo(gl, keep_trying = false) {
		if(!keep_trying && this.loading_texture_info) return;
		this.loading_texture_info = true;
		if(!this.has_loaded) {
			setTimeout(() => {this.loadImageAndCreateTextureInfo(gl, true)}, 10);
			return;
		}
		let tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

		let x_slot = this.image_index % this.num_cols;
		let y_slot = (this.image_index - x_slot) / this.num_cols;
		this.#texture_info = {
			low_x: x_slot * this.dimensions.x,
			low_y: y_slot * this.dimensions.y,
			sprite_width: this.dimensions.x,
			sprite_height: this.dimensions.y,
			width: this.dimensions.x * this.num_cols,
			height: this.dimensions.y * this.num_rows,
			texture: tex,
			model_matrix: this.transform.matrix
		};
		gl.bindTexture(gl.TEXTURE_2D, this.#texture_info.texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.img);
	}

	get texture_info(){
		if(this.#texture_info === null) return null;
		let x_slot = this.image_index % this.num_cols;
		let y_slot = (this.image_index - x_slot) / this.num_cols;
		this.#texture_info.low_x = x_slot * this.dimensions.x;
		this.#texture_info.low_y = y_slot * this.dimensions.y;
		this.#texture_info.model_matrix = this.transform.matrix;
		return this.#texture_info;
	}

	apply_when_loaded(callback){
		if(!this.has_loaded) setTimeout(() => {this.apply_when_loaded(callback)}, 10);
		else callback();
	}

	center_origin(){
		this.apply_when_loaded(() => { this.origin = this.dimensions.scale(0.5); });
	}
	
	get_image_arguments(){
		this.image_index %= this.num_rows * this.num_cols;
		
		let x_slot = this.image_index % this.num_cols;
		let y_slot = (this.image_index - x_slot) / this.num_cols;
		
		let sx = x_slot * this.dimensions.x;
		let sy = y_slot * this.dimensions.y;
		let swidth = this.dimensions.x;
		let sheight = this.dimensions.y;
	
		let scale = this.component.scale;
		let pos = this.component.position.sub(this.origin.component_mult(scale));
		scale = scale.component_mult(this.dimensions);
		return [this.img, sx, sy, swidth, sheight, pos.x, pos.y, scale.x, scale.y];
	}
	
	on_draw(screen){
		screen.drawImage(this);
	}
}


Sprite.from_sprite_sheet = function(image, num_rows, num_columns, callback=null, ...args){
	let img = new Sprite(image, ...args);
	img.num_rows = num_rows;
	img.num_cols = num_columns;
	img.apply_when_loaded( () => {
		img.dimensions.x /= num_columns;
		img.dimensions.y /= num_rows;
		if(callback !== null) callback(img);
	});

	img.deep_copy = function (){
		return Sprite.from_sprite_sheet(image, num_rows, num_columns, callback, ...args);
	}
	return img;
}
