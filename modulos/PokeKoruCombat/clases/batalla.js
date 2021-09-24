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

    constructor(idCreador,idImplicados, managerClass){
		super(idCreador,idImplicados)
		this.id_player1 = idImplicados[0]
		this.id_player2 = idImplicados[1]
		this.turno = 0
		this.managerClass = managerClass
		// Leemos el archivo creamos los jugadores y guardamos los datos por si hay posibles creaciones de usuario
		fs.readFile('./public/data/players.json', 'utf8' , (err, data) => {
			if (err) {
			  console.error(err)
			  return
			}
			var parseado = JSON.parse(data)
			this.player1 = new Player(this.id_player1,parseado);
			this.player2 = new Player(this.id_player2,parseado);
			parseado[this.id_player1] = {level : this.player1.level , exp :  this.player1.exp, winned :  this.player1.winned, losed :  this.player1.losed}
			parseado[this.id_player2] = {level : this.player2.level , exp :  this.player2.exp, winned :  this.player2.winned, losed :  this.player2.losed}
			fs.writeFile('./public/data/players.json', JSON.stringify(parseado) , function (err){
				if (err) return console.log(err);
			  });
			Promise.all([this.managerClass.app.ApiTwitch.getProfileImage(idImplicados)]).then((values) => { 
				this.player1.setProfileImage(values[0][0])
				this.player2.setProfileImage(values[0][1])
			})
		})
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
			var estaDebilitado = this.damagePlayer(this.getOtherPlayer(id_player).id_player)
			if(estaDebilitado){
				this.getPlayer(id_player).gainExperienece(this.getOtherPlayer(id_player))
			}
			return estaDebilitado
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

	start(firstTime = false){
		console.log('[Batalla]: Se comienza el evento')
		this.managerClass.loadGame(firstTime)
    }

}
