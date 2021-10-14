const utilities = require('./../../scripts/utilities')
const Batalla = require('./clases/batalla')
const fs = require('fs');
const { notEqual } = require('assert');
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
            if(this.app.eventManager.evento_actual instanceof Batalla){
                if(this.app.eventManager.evento_actual.idImplicados.includes(tags['username'])){
                    let {siguevivo,message} = this.app.eventManager.evento_actual.damageOtherPlayer(tags['username'])
                    if(siguevivo != undefined){
                        console.log('[PokeKoruCombat]: Sigue vivo -> '+siguevivo)
                        if(!siguevivo){
                            this.app.io.sockets.emit('function', {funcion: 'clearHTML'})
                            this.app.eventManager.terminarEvento()
                        }else{
                            this.app.io.sockets.emit('function', {funcion: 'take_damage', evento:  this.app.eventManager.evento_actual, player:  this.app.eventManager.evento_actual.getPlayerNumber( this.app.eventManager.evento_actual.getOtherPlayer(tags['username'])), message: message})
                        }
                        utilities.playSound('./modulos/PokeKoruCombat/sounds/punch.mp3')
                    }                               
                }
            }
        }
    }
    
    start(firstTime){
        console.log('[PokeKoruCombat]: Lodeamos el juego') // Segguir recorrido desde aqui
        try {
            var data = fs.readFileSync('./modulos/PokeKoruCombat/templates/PokeKoruCombat.ejs', 'utf8')
            var html = data
            //console.log('[PokeKoruCombat]: Cargamos el template -> \n'+html)
            var data = fs.readFileSync('./modulos/PokeKoruCombat/client-side/inject.js', 'utf8')
            var script = data
            //console.log('[PokeKoruCombat]: Cargamos el script -> \n'+script)
            this.app.io.sockets.emit('loadpage', {html: html, script: script})
            this.app.io.sockets.emit('function', {funcion: 'loadData',evento: this.app.eventManager.evento_actual, firstTime: firstTime})
            console.log('[PokeKoruCombat]: Terminamos de lodear')
          } catch (err) {
            console.log('[ERROR] -> [PokeKoruCombat]:'+err)
          }

    }

    isEvent(evento){
        return evento instanceof Batalla
    }

}