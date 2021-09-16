/**
 * La clase Evento guarda los datos:
 * 	tipo -> El tipo de evento que creamos
 * 	idCreador -> El id del usuario que crea el evento
 * 	idImplicados aquellos usuarios que van a participar en el evento
 * 
 * Hasta que el evento haya comenzado, el tipo de este será uno numérico el cual
 * 	la función startEvent() lo reconocerá y creará el tipo de evento correspondiente
 */
 module.exports = class Evento{
    constructor(tipo,idCreador,idImplicados){
		this.id = makeid(15)
        this.tipo = tipo;
        this.idCreador = idCreador;
        this.idImplicados = idImplicados;
    }
}


/**
 * Función que genera un string aleatorio
 * @param {*} length 
 * @returns 
 */
 function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}