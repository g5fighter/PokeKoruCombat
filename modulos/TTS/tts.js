const { spawn } = require('child_process');	// Libreria para ejecutar programas de python
const utilities = require('./../../scripts/utilities')
module.exports = class TTS{
    constructor(){
        
    }
    tratarMensaje(channel, tags, message, self){
        if(utilities.getInclusion(message, '!habla')) { // Comando para reproducir TTS del parametro dado
            child = spawn('python',['app.py',message.substring(7,message.length)]);
    
            child.stderr.on('data',(data) => {
                console.error(`stderr: ${data}`);
            } )
        }
    }
}