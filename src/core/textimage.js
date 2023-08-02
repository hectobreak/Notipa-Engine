/*
  TextImage class
  (c) Víctor "Hectobreak" Franco 2023, under MIT License
 */

const TextAlign = {
    Start: 'start',
    End: 'end',
    Left: 'left',
    Center: 'center',
    Right: 'right'
}

const TextBaseline = {
    Top: 'top',
    Bottom: 'bottom',
    Middle: 'middle',
    Alphabetic: 'alphabetic',
    Hanging: 'hanging'
}

class TextImage {
    #texture_info = null
    #dimensions
    #canvas
    #image
    #font_size = 30
    #font = "Arial"
    #align
    #baseline
    #text

    constructor(text = "",
                position= new Vector3D(),
                scale= new Vector3D(1, 1, 1),
                parent_object = null){
        new Component(this, new LinearTransform(position, scale), parent_object);
        this.origin = new Vector3D(0,0,0);
        this.#text = text;
        this.#dimensions = null;
        this.#canvas = null;
        this.#align = TextAlign.Start;
        this.#baseline = TextBaseline.Alphabetic;


        this.deep_copy = function(){
            let tmp = new TextImage(this.#text);
            tmp.transform = this.transform.copy();
            tmp.#font_size = this.#font_size;
            tmp.#font = this.#font;
            tmp.#align = this.#align;
            tmp.#baseline = this.#baseline;
            return tmp;
        }
    }

    get dimensions(){
        if(this.#dimensions === null){
            this.img;
        }
        return this.#dimensions.copy();
    }

    load_attributes(ctx){
        ctx.font = this.#font_size + "px " + this.#font;
    }

    get is_transparent(){
        return true;
    }

    get img(){
        if(this.#canvas === null){
            this.load_attributes(TextImage.singleton_context());
            let measures = TextImage.measure_text(this.#text);

            this.#canvas = document.createElement("canvas");
            this.#canvas.width = measures.box_width;
            this.#canvas.height = measures.box_height;
            let ctx = this.#canvas.getContext("2d");
            this.load_attributes(ctx);
            ctx.fillText(this.#text, measures.actualBoundingBoxLeft, measures.actualBoundingBoxAscent);
            this.#dimensions = new Vector3D(measures.box_width, measures.box_height, 1);

            const img_url = this.#canvas.toDataURL('image/png');
            this.#image = document.createElement("img");
            this.#image.src = img_url;
        }
        return this.#image;
    }

    get texture_matrix() {
        return [1, 0, 0, 0, 1, 0, 0, 0, 1];
    }

    loadImageAndCreateTextureInfo(gl) {
        let tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        this.#texture_info = {
            low_x: 0,
            low_y: 0,
            sprite_width: this.dimensions.x,
            sprite_height: this.dimensions.y,
            width: this.dimensions.x,
            height: this.dimensions.y,
            texture: tex,
            model_matrix: this.transform.mult(new LinearTransform(new Vector3D(), this.dimensions)).transform_transpose,
            texture_matrix: this.texture_matrix
        };
        gl.bindTexture(gl.TEXTURE_2D, this.#texture_info.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.img);
    }

    get texture_info(){
        if(this.#texture_info === null) return null;
        this.#texture_info.low_x = 0;
        this.#texture_info.low_y = 0;
        this.#texture_info.model_matrix =
            this.cascade_transform.mult(new LinearTransform(
                    this.origin.scale(-1),
                    this.dimensions,
                    null
                )
            ).transform_transpose;
        this.#texture_info.texture_matrix = this.texture_matrix;
        return this.#texture_info;
    }

    on_draw(screen){
        screen.drawImage(this);
    }
}

{
    let singleton_canvas = document.createElement("canvas");
    let ctx = singleton_canvas.getContext("2d");
    TextImage.singleton_context = function(){
        return ctx;
    }
    TextImage.measure_text = function(...params){
        let measures = ctx.measureText(...params);
        measures.box_width = measures.actualBoundingBoxLeft + measures.actualBoundingBoxRight;
        measures.box_height = measures.actualBoundingBoxAscent + measures.actualBoundingBoxDescent;
        return measures;
    }
}
