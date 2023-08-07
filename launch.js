const fs = require('fs');
const path = require('path');
const readline = require('readline');
const process = require("process");


const core_path = 'core/';
const app_path = 'app/';
const app_descriptor = 'app/app.json';

function load_js_files(directory, callback){
    fs.readdir(directory, function(err, files){
        if(err) {
            console.error(err);
            process.exit(1);
        }
        let directories = [];
        let js_files = [];
        for(let file of files){
            let file_path = path.join(directory, file);
            if(fs.lstatSync(file_path).isDirectory()) {
                directories.push(file_path);
            } else if(path.extname(file) === '.js'){
                js_files.push(file_path);
            }
        }

        let new_callback = (new_files) => callback(js_files.concat(new_files));
        for(let i = directories.length - 1; i >= 0; --i){
            let tmp = new_callback;
            new_callback = function(new_files){
                load_js_files(directories[i], current_files => tmp(new_files.concat(current_files)));
            }
        }
        new_callback([]);
    });
}

load_js_files(core_path, function(core_files) {
    load_js_files(app_path, function(app_files){
        let core_imports = core_files.map(x => '<script src="'+x+'"></script>').join("\n");
        let app_imports = app_files.map(x => '<script src="'+x+'"></script>').join("\n");
        let index_contents = '<body style="overflow: hidden;"></body>\n' + core_imports + app_imports;
        try {
            fs.writeFileSync('index.html', index_contents);
            main();
        } catch (e){
            console.error(e);
            process.exit(1);
        }
    });
});

function main(){
    const { app, BrowserWindow } = require('electron');
    const createWindow = () => {
        let desc = JSON.parse(fs.readFileSync(app_descriptor));
        const win = new BrowserWindow(desc);
        if(desc["SETTING[setMenu]"] !== undefined)
            win.setMenu(desc["SETTING[setMenu]"]);
        win.loadFile('index.html');
    }

    app.whenReady().then(() => {
        createWindow();

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) createWindow();
        })
    });

    app.on('window-all-closed', () => {
        fs.unlinkSync('index.html');
        if (process.platform !== 'darwin') app.quit();
    });
}

