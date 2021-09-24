const utilities = require('./../../scripts/utilities')
const Batalla = require('./clases/batalla')
module.exports = class PokeKoruCombat{
    constructor(app){
        this.app = app
    }

    tratarMensaje(channel, tags, message, self){
        if(utilities.getInclusion(message, '!jugar')){ // Comando para cargar el juego
            console.log('[PokeKoruCombat]: Tratando mensaje')
            var menciones = message.substring(6,message.length);
            var usuariosTomados = []
            menciones = menciones.split(/(\s+)/);
            menciones.forEach(element => {
                if(element.startsWith("@")){
                    usuariosTomados.push(element.substring(1,element.length).toLowerCase())
                }
            });
            Promise.all([this.app.ApiTwitch.getUser(usuariosTomados)]).then((values) => { 
                var batalla = new Batalla(tags['username'],values[0],this.app);
                batalla.setImages(this.app).then(res => {
                    console.log('[PokeKoruCombat]: He creado batalla')
                    this.app.eventManager.createEvent(batalla);
                }).catch(err => {
                    console.log(err)
                })

            }).catch(function(reason) {
                console.log(reason);
            });
            console.log('[PokeKoruCombat]: Termino tratando mensaje')
        }else if(utilities.getInclusion(message, '!ataque')){ // Comando para atacar al rival
            if(this.app.eventManager.evento_actual==null){
                return
            }
            if( this.app.eventManager.evento_actual instanceof Batalla){
                if( this.app.eventManager.evento_actual.idImplicados.includes(tags['username'])){
                    if(! this.app.eventManager.evento_actual.damageOtherPlayer(tags['username'])){
                        this.app.io.sockets.emit('deblitado', {evento:  this.app.eventManager.evento_actual})
                        this.app.eventManager.terminarEvento()
                    }else{
                        this.app.io.sockets.emit('take_damage', {evento:  this.app.eventManager.evento_actual, player:  this.app.eventManager.evento_actual.getPlayerNumber( this.app.eventManager.evento_actual.getOtherPlayer(tags['username']))})
                    }
                    utilities.playSound('./public/sound/punch.mp3')
                
                }
            }
        }
    }
    
    start(firstTime){
        console.log('[PokeKoruCombat]: Lodeamos el juego') // Segguir recorrido desde aqui
        this.app.io.sockets.emit('change_to_game', {evento: this.app.eventManager.evento_actual, firstTime: firstTime})
    }

    isEvent(evento){
        return evento instanceof Batalla
    }

}