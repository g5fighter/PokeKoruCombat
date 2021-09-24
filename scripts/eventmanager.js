module.exports = class EventManager{
    constructor(app){
        this.app = app
        this.eventos = []		// Guarda una lista con todos los eventos
        this.evento_actual = null	// Guarda el evento_actual
        this.modulos = []
    }

    loadModule(modulo){
        this.modulos.push(modulo)
        console.log('[EventManager]: Modulo cargado -> '+modulo.constructor.name)
    }

    /**
     * Crea un evento con los parametros dados, y si no hay ninguno en ejecucion lo ejecuta
     * @param {*} tipo 
     * @param {*} idCreador 
     * @param {*} idImplicados 
     */
    createEvent(evento){
        console.log('[EventManager]: Se crea el evento')
        if(this.eventos.length > 0 || this.evento_actual != null){
            this.eventos.push(evento);
        }else{
            this.startEvent(evento)
            this.evento_actual = evento
        }
    }

    /**
     * Configura un evento y lo ejecuta
     * @param {*} evento 
     */
    startEvent(evento){
        console.log('[EventManager]: Se comienza el evento')
        this.evento_actual = evento
        evento.start()
    }

    terminarEvento(){
        evento_actual = null
        if(eventos.length > 0 ){
            eventoahora = eventos.pop()
            this.startEvent(eventoahora)
            evento_actual = eventoahora
        }
    }
}