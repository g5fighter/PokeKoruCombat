const utilities = require('./../../scripts/utilities')
module.exports = class RaidClip{
    constructor(app){
        this.app = app    
    }

    tratarMensaje(channel, tags, message, self){
        if(utilities.getInclusion(message, '!clip')){
			var menciones = message.substring(5,message.length);
			this.app.ApiTwitch.getClipLink('g5fighter')
		}
    }
}