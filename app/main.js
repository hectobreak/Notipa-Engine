
let engine = new Engine(800, 600);

let test_instance = new Instance();

let click_box = Clickbox3D.fromQuad(256, 256, new Vector3D(128, 128, 0));

let s1 = Sprite.from_sprite_sheet(
    "https://cdn.discordapp.com/attachments/342608530236375040/1123983846963159082/image.png",
    1,
    2,
    (sprite) => { sprite.center_origin() }
);
s1.add_component(click_box);
s1.rotation = Quaternion.fromEulerAngles(0, Math.PI, 0);
s1.position = new Vector3D(0, 0, 126);
test_instance.component.add_component(s1);

let s2 = s1.deep_copy();
s2.position = new Vector3D(0, 0, -126);
test_instance.component.add_component(s2);

let s3 = s1.deep_copy();
s3.rotation = Quaternion.fromEulerAngles(0, Math.PI/2, 0);
s3.position = new Vector3D(-126, 0, 0);
test_instance.component.add_component(s3);

let s4 = s1.deep_copy();
s4.rotation = Quaternion.fromEulerAngles(0, -Math.PI/2, 0);
s4.position = new Vector3D(126, 0, 0);
test_instance.component.add_component(s4);

let s5 = s1.deep_copy();
s5.rotation = Quaternion.fromEulerAngles(0, 0, -Math.PI/2);
s5.position = new Vector3D(0, -126, 0);
test_instance.component.add_component(s5);

let s6 = s1.deep_copy();
s6.rotation = Quaternion.fromEulerAngles(0, 0, Math.PI/2);
s6.position = new Vector3D(0, 126, 0);
test_instance.component.add_component(s6);

test_instance.position = new Vector3D(400, 300, 0);
test_instance.rvec = new Vector3D(0, 0, 1);
test_instance.rang = 0;
test_instance.delta_rang = 0;
test_instance.delta_rvec = new Vector3D();

test_instance.step = function(){
    this.delta_rvec = this.delta_rvec.add(new Vector3D(Math.random()*0.01-0.005,Math.random()*0.01-0.005,Math.random()*0.01-0.005));
    if(this.delta_rvec.magnitude > 0.5) this.delta_rvec = this.delta_rvec.scale(0.5 / this.delta_rvec.magnitude);
    this.rvec = this.rvec.add(this.delta_rvec).normalized;
    this.delta_rang += Math.random() * 0.01 - 0.005;
    if(this.delta_rang > 5) this.delta_rang = 5;
    if(this.delta_rang < -5) this.delta_rang = -5;
    this.delta_rang *= Math.pow(0.6, Engine.singleton.deltaTime);
    this.rang += this.delta_rang;

    this.rotation = Quaternion.fromAxisAndAngle(this.rvec, this.rang);
    if(this.speed === undefined) this.speed = new Vector3D();
    this.position = this.position.add(this.speed.scale(Engine.singleton.deltaTime));
    this.speed = this.speed.add(new Vector3D(0, 500 * Engine.singleton.deltaTime))
        .scale(Math.pow(0.9, Engine.singleton.deltaTime));
    if(this.position.y > 550) {
        this.position.y = 550 - 2 * (this.position.y - 550);
        this.speed.y = - Math.abs(this.speed.y);
    }
    if(this.position.y < 50) {
        this.position.y = 50 - 2 * (this.position.y - 50);
        this.speed.y = Math.abs(this.speed.y);
    }
    if(this.position.x > 750) {
        this.position.x = 750 - 2 * (this.position.x - 750);
        this.speed.x = - Math.abs(this.speed.x);
    }
    if(this.position.x < 50) {
        this.position.x = 50 - 2 * (this.position.x - 50);
        this.speed.x = Math.abs(this.speed.x);
    }
    // let scaling = (this.speed.y * this.speed.y * 5e-7 + 1);
    // if(this.speed.y < 0) {
    //     this.scale = new Vector3D(0.5 * scaling, 0.5 / scaling, 0.5);
    // } else {
    //     this.scale = new Vector3D(0.5 / scaling, 0.5 * scaling, 0.5);
    // }

    this.scale = new Vector3D(0.5, 0.5, 0.5);
}

test_instance.on_key_down = function(key){
    if(key === 'LeftClick'){
        let is_clicking = false;
        let clickers = this.get_components(Sprite).map(x => x.get_component(Clickbox3D));
        for(let clicker of clickers){
            clicker.project();
            if(clicker.is_clicking()){
                is_clicking = true;
                break;
            }
        }
        if( is_clicking )
            for(let sprite of this.get_components(Sprite)){
                sprite.image_index += 1;
                this.speed = this.speed.add(new Vector3D(Math.random() * 400 - 200, Math.random() * 400 - 200, 0));
                this.delta_rang *= 1.2;
            }
    }
}

test_instance.create = function(){
    this.position.x = Math.random() * 700 + 50;
    this.position.y = Math.random() * 500 + 50;
}

let test_instantiation1 = engine.instantiate(test_instance);
let test_instantiation2 = engine.instantiate(test_instance);

let test_text = new TextImage("Hello World!\nGoodbye World!");
test_text.position.x = 100;
test_text.position.y = 100;
let test_textinstance = engine.instantiate(test_text);


// test_instance.position = new Vector3D(600, 300, 0);
// test_instance.get_component(Sprite).image_index += 1;
// let test_instantiation2 = engine.instantiate(test_instance);
