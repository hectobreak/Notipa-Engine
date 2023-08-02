/*
  InputIntercept class
  (c) Víctor "Hectobreak" Franco 2023, under MIT License
 */

class InputIntercept {
    constructor() {
        new Component(this);
        this.keymask = {};
        this.mouse = new Vector2D();

        this.listeners = [];

        let mouse_keys = {
            'LeftClick': 1,
            'RightClick': 2,
            'MouseWheel': 4,
            'BrowseBack': 8,
            'BrowseFwd': 16
        }

        let intercepter = this;

        document.body.addEventListener('keydown', function(event){
            event = event || window.event;
            let char_code = event.code;
            intercepter.press(char_code);
        });

        document.body.addEventListener('keyup', function(event){
            event = event || window.event;
            let char_code = event.code;
            intercepter.release(char_code);
            return false;
        });

        document.body.addEventListener('mousemove', function (event){
            intercepter.mouse.x = event.clientX;
            intercepter.mouse.y = event.clientY;
        });

        function mouse_intercept(event){
            intercepter.mouse.x = event.clientX;
            intercepter.mouse.y = event.clientY;
            for(let key_name of Object.keys(mouse_keys)){
                let key_code = mouse_keys[key_name];
                if((event.buttons & key_code) > 0)
                    intercepter.press(key_name);
                else
                    intercepter.release(key_name);
            }
        }

        document.body.addEventListener('mousedown', mouse_intercept);
        document.body.addEventListener('mouseup', mouse_intercept);
    }

    press(key){
        this.keymask[key] = true;
        for(let listener of this.listeners){
            if(listener.on_key_down !== undefined){
                listener.on_key_down(key);
            }
        }
    }

    release(key){
        delete this.keymask[key];
        for(let listener of this.listeners){
            if(listener.on_key_up !== undefined){
                listener.on_key_up(key);
            }
        }
    }

}