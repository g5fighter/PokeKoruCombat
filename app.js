// Requires
require('dotenv').config({path: __dirname + '/.env'}) // Configura el archivo de variables de entrono
const express = require('express')
const socketio = require('socket.io')	// Libreria de servidor
const { spawn } = require('child_process');	// Libreria para ejecutar programas de python
const tmi = require('tmi.js');	// Libreria que maneja el chat de Twitch
const fs = require('fs');	// Libreria que maneja la lectura y escritura de archivos

// Variables globales
var clientTwitchToken	// Guarda el Token del cliente de Twitch
var eventos = []		// Guarda una lista con todos los eventos
var evento_actual = null	// Guarda el evento_actual
const port = 5000	// Puerto que abre el servidor
const channelandusername = 'g5fighter_design';	// Canal al que se conecta y usuario que usará el bot
const oauth = process.env['OAUTH_TOKEN']	// Oauth Token tomado desde -> https://twitchapps.com/tmi/
const tipoEvento = {	// Enumerator que almacena los tipos de evento
	BATALLA: 0,
}

// Clases

/**
 * La clase Evento guarda los datos:
 * 	tipo -> El tipo de evento que creamos
 * 	idCreador -> El id del usuario que crea el evento
 * 	idImplicados aquellos usuarios que van a participar en el evento
 * 
 * Hasta que el evento haya comenzado, el tipo de este será uno numérico el cual
 * 	la función startEvent() lo reconocerá y creará el tipo de evento correspondiente
 */
class Evento{
    constructor(tipo,idCreador,idImplicados){
        this.tipo = tipo;
        this.idCreador = idCreador;
        this.idImplicados = idImplicados;
    }
}

 /**
  * La clase Batalla es un tipo de evento que guarda:
  * 	- Los jugadores implicados
  * 	- El turno del combate
  * 
  */
class Batalla{

    constructor(id_player1,id_player2,fs){
		this.turno = 0
		// Leemos el archivo creamos los jugadores y guardamos los datos por si hay posibles creaciones de usuario
		fs.readFile('public/data/players.json', 'utf8' , (err, data) => {
			if (err) {
			  console.error(err)
			  return
			}
			var parseado = JSON.parse(data)
			this.player1 = new Player(id_player1,parseado);
			this.player2 = new Player(id_player2,parseado);
			parseado[id_player1] = {level : this.player1.level , exp :  this.player1.exp, winned :  this.player1.winned, losed :  this.player1.losed}
			parseado[id_player2] = {level : this.player2.level , exp :  this.player2.exp, winned :  this.player2.winned, losed :  this.player2.losed}
			fs.writeFile('public/data/players.json', JSON.stringify(parseado) , function (err){
				if (err) return console.log(err);
			  });
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
		return this.damagePlayer(this.getOtherPlayer(id_player).id_player)
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

}

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
class Player{
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

// Funciones

/**
 * Funcion que comprueba si el comando está incluido en el juego
 * @param {*} message 
 * @param {*} comand 
 * @returns 
 */
function getInclusion(message, comand) {
	if(message.toLowerCase().includes(comand)){
		return true;
	}
	return false;
}

/**
 * Funcion que obtiene las credenciales del cliente de Twitch
 * @param {*} oauth 
 * @returns 
 */
function getTwitchCredentials(oauth){
	return new Promise(function(resolve, reject) {
	var url = "https://id.twitch.tv/oauth2/validate";

	var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url);

	xhr.setRequestHeader("Authorization", "OAuth "+oauth.substring(6,oauth.length));
	xhr.onreadystatechange = function () {
	if (xhr.readyState === 4) {
		const obj = JSON.parse(xhr.responseText);
		resolve(obj['client_id']);
	}};

	xhr.send();
});	
}

/**
 * Funcion que devuelve las imagenes de perfil de los usuarios dados
 * @param {*} users 
 * @returns 
 */
function getProfileImage(users){
	return new Promise(function(resolve, reject) {
	var url = "https://api.twitch.tv/kraken/users?login=";
	users.forEach(element => (url += element + ","));
	url = url.substring(0, url.length-1);

	var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url);
	
	xhr.setRequestHeader("Accept", "application/vnd.twitchtv.v5+json");
	xhr.setRequestHeader("Client-ID",clientTwitchToken);

	xhr.onreadystatechange = function () {
	if (xhr.readyState === 4) {
		const obj = JSON.parse(xhr.responseText);
		var user1 = obj['users'][0]['logo'];
		var user2 = obj['users'][1]['logo'];
		resolve([user1,user2]);
	}};

	xhr.send();
});	
}

/**
 * Devuelve los nombres de los usurios dados, si estos existen
 * @param {*} users 
 * @returns 
 */
function getUser(users){
	return new Promise(function(resolve, reject) {
	var url = "https://api.twitch.tv/kraken/users?login=";
	users.forEach(element => (url += element + ","));
	url = url.substring(0, url.length-1);

	var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url);
	
	xhr.setRequestHeader("Accept", "application/vnd.twitchtv.v5+json");
	xhr.setRequestHeader("Client-ID",clientTwitchToken);

	xhr.onreadystatechange = function () {
	if (xhr.readyState === 4) {
		const obj = JSON.parse(xhr.responseText);
		var usuariosDevueltos = []
		if(obj['_total']>1){
			obj['users'].forEach(element => usuariosDevueltos.push(element['name']));
			resolve(usuariosDevueltos);
		}else{
			reject('no hay usuarios suficientes -> '+ obj['_total']);
		}	
	}};

	xhr.send();
});	
}

/**
 * Crea un evento con los parametros dados, y si no hay ninguno en ejecucion lo ejecuta
 * @param {*} tipo 
 * @param {*} idCreador 
 * @param {*} idImplicados 
 */
function createEvent(tipo,idCreador,idImplicados){
	var evento = new Evento(tipo,idCreador,idImplicados);
	if(eventos.length > 0 || evento_actual != null){
		eventos.push(evento);
	}else{
		startEvent(evento)
		evento_actual = evento
	}
}

/**
 * Configura un evento y lo ejecuta
 * @param {*} evento 
 */
function startEvent(evento){
	evento_actual = evento
	switch(evento.tipo){
		case 0:
			evento.tipo = new Batalla(evento.idImplicados[0],evento.idImplicados[1],fs)
			Promise.all([getProfileImage(evento.idImplicados)]).then(function(values) { 
				//username1: evento.idImplicados[0], username2: evento.idImplicados[1], profile1: values[0][0], profile2: values[0][1]
				io.sockets.emit('change_to_game', {evento: evento, profile1: values[0][0], profile2: values[0][1]})
			}).catch(function(reason) {
				// one of the AJAX calls failed
				console.log(reason);
			});
			;
			
			break;
	}
}

// Creacion del servidor y configuracion de las rutas
const app = express()

// Archivos estaticos
app.use(express.static('public'));
// Ejemplo de configuracion de carpeta especifica
// app.use('/css', express.static(__dirname + 'public/css'))

// Set View's
app.set('views', './views');
app.set('view engine', 'ejs');

// Navegacion
app.get('', (req, res) => {
    res.render('home', { text: 'Hey' })
})
// Ejemplo de como configurar la renderizacion de una pagina navegando en un apartado
/*app.get('/game', (req, res) => {
	res.render(__dirname + '/views/PokeKoruCombat.ejs')
 })*/



// Configuracion del sistema de intercambio de mensajes entre el servidor y los clientes
const server = app.listen(port, () => console.info(`App listening on port ${port}`))

const io = socketio(server)

io.on('connection', socket => {
    console.log("Nuevo cliente conectado")
})


// Obtención de credenciales para Twitch
Promise.all([getTwitchCredentials(oauth)]).then(function(values) { 
clientTwitchToken = values[0];
}).catch(function(reason) {
	console.log(reason);
});

// Conexión al IRC de Twitch
const client = new tmi.Client({
	options: { debug: true },
	identity: {
		username: channelandusername,
		password: oauth
	},
	channels: [ channelandusername ]
});

client.connect();


// Administrador de mensajes de Twitch

client.on('message', (channel, tags, message, self) => {
	if(self) return;

	if(message.startsWith('!')){
		if(getInclusion(message, '!habla')) { // Comando para reproducir TTS del parametro dado
			child = spawn('python',['app.py',message.substring(7,message.length)]);
			
			child.stdout.on('data',(data) => {
				console.log(`stderr: ${data}`);
			} )

			child.stderr.on('data',(data) => {
				console.error(`stderr: ${data}`);
			} )
		}else if(getInclusion(message, '!jugar')){ // Comando para cargar el juego
			var menciones = message.substring(6,message.length);
			var usuariosTomados = []
			menciones = menciones.split(/(\s+)/);
			menciones.forEach(element => {
				if(element.startsWith("@")){
					usuariosTomados.push(element.substring(1,element.length))
				}
			});
			Promise.all([getUser(usuariosTomados)]).then(function(values) { 
				createEvent(0,tags['username'],values[0]);
			}).catch(function(reason) {
				console.log(reason);
			});
		}else if(getInclusion(message, '!ataque1')){ // Comando para atacar al rival
			if(evento_actual.tipo instanceof Batalla){
				if(evento_actual.idImplicados.includes(tags['username'])){
					//console.log('Mi player : '+tags['username'])
					evento_actual.tipo.damageOtherPlayer(tags['username'])
					io.sockets.emit('take_damage', {life1: evento_actual.tipo.player1.ps,life2:  evento_actual.tipo.player2.ps, maxlife1 : evento_actual.tipo.player1.psBase, maxlife2 : evento_actual.tipo.player2.psBase})
				}
			}
		}
		else if(getInclusion(message, '!test')){ // Comando para hacer tests
			console.log(JSON.stringify(tags, null, 4));
		}
	}
});

