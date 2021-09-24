const player = require('play-sound')(opts = {})
module.exports = class utilities{
    /**
     * Funcion que comprueba si el comando está incluido en el juego
     * @param {*} message 
     * @param {*} command 
     * @returns 
     */
    static getInclusion(message, command) {
        if(message.toLowerCase().includes(command)){
            return true;
        }
        return false;
    }

    /**
     * Función que reproduce un sonido
     * @param {*} sound 
     */
    static async playSound(sound){
        let audio = player.play(sound, function(err){
            if (err) throw err
        })
        await utilities.sleep(1000)
        audio.kill();
    }

    /**
     * Funcion que creao una espera asincrona
     * @param {int} ms 
     * @returns 
     */
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
}