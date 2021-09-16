/**
 * La clase Player maneja todos los datos del jugador
 * 	- El nivel
 * 	- La cantidad de experiencia del nivel actual
 * 	- La vida
 * 	- La vida maxima del nivel
 * 	- El aqtaque
 * 	- Las partidas ganadas
 * 	- Las partidas perdidas
 * 
 */
 module.exports = class Player{
    constructor(id_player,parseado){
        this.id_player = id_player;
			if(parseado[id_player]==null){
				this.level = 1
				this.exp = 0
				this.ps = 100; 
				this.psBase = 100; 
				this.ataque = 10;
				this.winned = 0;
				this.losed = 0;
			}else{
				this.exp = parseado[id_player]['exp']
				this.level = parseado[id_player]['level']
				this.ps = 100 * (1.05 ** (this.level-1)); 
				this.psBase = 100 * (1.05 ** (this.level-1)); 
				this.ataque = 10 * (1.05 ** (this.level-1));;
				this.winned = parseado[id_player]['winned']
				this.losed = parseado[id_player]['losed']
			}
    }

	/**
	 * Función que daña al jugador en caso de debilitarlo devuelve false
	 * @param {*} damage 
	 * @returns 
	 */
    damagePlayer(damage){
        this.ps -= damage;
        if(this.ps <= 0){
            return false;
        }else{
            return true;
        }
    }

	/**
	 * Funcion que recupera al jugador hasta su máximo
	 * @param {*} recover 
	 */
    recoverPlayer(recover){
        this.ps += recover;
        if(this.ps > this.psBase){
            this.ps = this.psBase;
        }
    }

	/**
	 * Funcion que añade la experiencia al jugador, y luego guarda sus datos
	 * @param {*} amount 
	 */
	gainExperienece(amount){
		this.exp += amount;
		var expEsteNivel = 10*(1.1**(this.level-1))
		if(this.exp > expEsteNivel){
			this.exp -= expEsteNivel
			this.level+=1;
		}
		fs.readFile('public/data/players.json', 'utf8' , (err, data) => {
			if (err) {
			  console.error(err)
			  return
			}
			parseado = JSON.parse(data)
			if(parseado[id_player]==null){
				parseado[id_player] = {level : this.level , exp : this.exp, winned : this.winned, losed : this.losed}
				fs.writeFile('public/data/players.json', JSON.stringify(parseado) , function (err){
					if (err) return console.log(err);
				  });
			}
		  })
	}
}