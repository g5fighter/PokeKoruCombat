const Player = require("./player");
const fs = require('fs');
const Evento = require('./../../../scripts/evento')

 /**
  * La clase Batalla es un tipo de evento que guarda:
  * 	- Los jugadores implicados
  * 	- El turno del combate
  * 
  */
  module.exports = class Batalla extends Evento{

    constructor(idCreador,idImplicados, app){
		console.log('[Batalla]: Creamos batalla')
		super(idCreador,idImplicados)
		this.turno = 0

		// Leemos el archivo creamos los jugadores y guardamos los datos por si hay posibles creaciones de usuario
		console.warn('[Batalla]: Leemos archivo')
		var data = fs.readFileSync('./public/data/players.json', 'utf8')
		var parseado = JSON.parse(data)
		this.player1 = new Player(idImplicados[0],parseado);
		this.player2 = new Player(idImplicados[1],parseado);
		
		parseado[idImplicados[0]] = {level : this.player1.level , exp :  this.player1.exp, winned :  this.player1.winned, losed :  this.player1.losed}
		parseado[idImplicados[1]] = {level : this.player2.level , exp :  this.player2.exp, winned :  this.player2.winned, losed :  this.player2.losed}

		fs.writeFileSync('./public/data/players.json', JSON.stringify(parseado) , function (err){
			if (err) return console.log(err);
		  });

		console.log('[Batalla]: Terminamos de crear batalla')
    }

	async setImages(app){

		var values = await app.ApiTwitch.getProfileImage([this.player1.id_player,this.player2.id_player])
		this.player1.setProfileImage(values[0])
		this.player2.setProfileImage(values[1])
		console.log('[Batalla]: Images seted')

	}

	/**
	 * Función que daña al jugador con el ID y el valor proporcionado
	 * 
	 * @param {*} id_player 
	 * @param {*} amount 
	 * @returns 
	 */
    damagePlayer(id_player) {
		this.changeTurno()
		var amount = this.createAttack(this.getPlayer(id_player))
		switch(id_player){
			case this.player1.id_player:
				return this.player1.damagePlayer(amount);
			case this.player2.id_player:
				return this.player2.damagePlayer(amount);
			default :
				console.error(`[DamagePlayer] El jugador con ID -> ${id_player} no se encuentra en esta batalla`);
				break;
		}
    }

	/**
	 * Funcion que daña al rival con el daño adjudicado
	 * @param {*} id_player 
	 * @param {*} amount 
	 * @returns 
	 */
	damageOtherPlayer(id_player){
		if(this.isRonda(id_player)){
			var siguevivo = this.damagePlayer(this.getOtherPlayer(id_player).id_player)
			if(!siguevivo){
				this.getPlayer(id_player).gainExperienece(this.getOtherPlayer(id_player))
			}
			return siguevivo
		}
	}

	/**
	 * Dado un parámetro id_player esta función devuelve si es su turno o no.
	 * @param {*} id_player 
	 * @returns 
	 */
	isRonda(id_player){
		if(id_player == this.player1.id_player){
			if(this.turno%2==0){
				return true
			}else{
				return false
			}
		}else{
			if(this.turno%2==1){
				return true
			}else{
				return false
			}
		}
	}

	/**
	 * Función que recupera al jugador con el ID y el valor proporcionado
	 * 
	 * @param {*} id_player 
	 * @param {*} amount 
	 * @returns 
	 */
    recoverPlayer (id_player, amount){
		switch(id_player){
			case this.player1.id_player:
				return this.player1.recoverPlayer(amount);
			case this.player2.id_player:
				return this.player2.recoverPlayer(amount);
			default :
				console.error(`[RecoverPlayer] El jugador con ID -> ${id_player} no se encuentra en esta batalla`);
				break;
		}
    }

	/**
	 * Función que devuelve el objeto del jugador contrario al que se le proporciona
	 * 
	 * @param {*} id_player 
	 * @returns 
	 */
	getOtherPlayer(id_player){
		switch(id_player){
			case this.player1.id_player:
				return this.player2
			case this.player2.id_player:
				return this.player1
			default :
				console.error(`[GetOtherPlayer] El jugador con ID -> ${id_player} no se encuentra en esta batalla`);
				break;
		}
	}

	/**
	 * Función que avanza al próximo turno
	 */
	changeTurno(){
		this.turno+=1;
	}

	/**
	 * Función que devuelve el objeto del jugador que se le proporciona
	 * 
	 * @param {*} id_player 
	 * @returns 
	 */
	getPlayer(id_player){
		switch(id_player){
			case this.player1.id_player:
				return this.player1
			case this.player2.id_player:
				return this.player2
			default :
				console.error(`[GetPlayer] El jugador con ID -> ${id_player} no se encuentra en esta batalla`);
				break;
		}
	}

	/**
	 * Función que calcula el daño del ataque
	 * @param {Player} player 
	 * @returns 
	 */
	createAttack(player){
		var probAtaque = Math.floor(Math.random() * 100);
		if(probAtaque < 60){
			return player.ataque 
		}else if (probAtaque < 90){
			return player.ataque + player.ataque/3
		}else{
			return player.ataque + player.ataque*0.75
		}
	}

	getPlayerNumber(player){
		switch(player.id_player){
			case this.player1.id_player:
				return 0
			case this.player2.id_player:
				return 1
			default :
				console.error(`[GetPlayer] El jugador con ID -> ${id_player} no se encuentra en esta batalla`);
				break;
		}

	}

	/*start(firstTime = false){
		console.log('[Batalla]: Se comienza el evento')
		this.managerClass.loadGame(firstTime)
    }*/

}
