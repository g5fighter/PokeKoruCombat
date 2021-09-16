// Requires
require('dotenv').config({path: __dirname + '/.env'}) // Configura el archivo de variables de entrono
const express = require('express')
const socketio = require('socket.io')	// Libreria de servidor
const { spawn } = require('child_process');	// Libreria para ejecutar programas de python
const tmi = require('tmi.js');	// Libreria que maneja el chat de Twitch
const fs = require('fs');	// Libreria que maneja la lectura y escritura de archivos
const player = require('play-sound')();
const Evento = require("./scripts/evento");
const Batalla = require("./scripts/batalla");

// Variables globales
var clientTwitchToken = null	// Guarda el Token del cliente de Twitch
var eventos = []		// Guarda una lista con todos los eventos
var evento_actual = null	// Guarda el evento_actual
const port = 5000	// Puerto que abre el servidor
const channelandusername = process.env['CHANNEL'];	// Canal al que se conecta y usuario que usará el bot
const oauth = process.env['OAUTH_TOKEN']	// Oauth Token tomado desde -> https://twitchapps.com/tmi/
const tipoEvento = {	// Enumerator que almacena los tipos de evento
	BATALLA: 0,
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
		if(users[0] == obj['users'][0]['name']){
			resolve([obj['users'][0]['logo'],obj['users'][1]['logo']]);
		}else{
			resolve([obj['users'][1]['logo'],obj['users'][0]['logo']]);
		}
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
		var resultado = []
		if(obj['_total']>1){
			obj['users'].forEach(element => usuariosDevueltos.push(element['name']));
			users.forEach(function(element) {
				if(usuariosDevueltos.includes(element)){
					resultado.push(element)
				}
			});
			resolve(resultado);
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
			evento.tipo = new Batalla(evento.idImplicados[0],evento.idImplicados[1])		
			cargarJuego()
			break;
	}
}

function cargarJuego(firstTime = false){
	Promise.all([getProfileImage(evento_actual.idImplicados)]).then(function(values) { 
		io.sockets.emit('change_to_game', {evento: evento_actual, profile1: values[0][0], profile2: values[0][1], firstTime: firstTime})
	}).catch(function(reason) {
		// one of the AJAX calls failed
		console.log(reason);
	});	
}

function terminarEvento(){
	evento_actual = null
	if(eventos.length > 0 ){
		eventoahora = eventos.pop()
		startEvent(eventoahora)
		evento_actual = eventoahora
	}
}

/**
 * Función que reproduce un sonido
 * @param {*} sound 
 */
async function playSound(sound){
	let audio = player.play(sound, function(err){
		if (err) throw err
	  })
	  await sleep(1000)
	  audio.kill();
}

/**
 * Funcion que creao una espera asincrona
 * @param {int} ms 
 * @returns 
 */
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
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
	if(evento_actual!=null){
		cargarJuego(true)
	}
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

//while(clientTwitchToken==null){
//}
client.on('message', (channel, tags, message, self) => {
	if(self) return;

	if(message.startsWith('!')){
		if(getInclusion(message, '!habla')) { // Comando para reproducir TTS del parametro dado
			child = spawn('python',['app.py',message.substring(7,message.length)]);

			child.stderr.on('data',(data) => {
				console.error(`stderr: ${data}`);
			} )
		}else if(getInclusion(message, '!jugar')){ // Comando para cargar el juego
			var menciones = message.substring(6,message.length);
			var usuariosTomados = []
			menciones = menciones.split(/(\s+)/);
			menciones.forEach(element => {
				if(element.startsWith("@")){
					usuariosTomados.push(element.substring(1,element.length).toLowerCase())
				}
			});
			Promise.all([getUser(usuariosTomados)]).then(function(values) { 
				createEvent(0,tags['username'],values[0]);
			}).catch(function(reason) {
				console.log(reason);
			});
		}else if(getInclusion(message, '!ataque')){ // Comando para atacar al rival
			if(evento_actual==null){
				return
			}
			if(evento_actual.tipo instanceof Batalla){
				if(evento_actual.idImplicados.includes(tags['username'])){
					if(!evento_actual.tipo.damageOtherPlayer(tags['username'])){
						io.sockets.emit('deblitado', {evento: evento_actual})
						terminarEvento()
					}else{
						io.sockets.emit('take_damage', {evento: evento_actual, player: evento_actual.tipo.getPlayerNumber(evento_actual.tipo.getOtherPlayer(tags['username']))})
					}
					playSound('public/sound/punch.mp3')
				
				}
			}
		}
		else if(getInclusion(message, '!test')){ // Comando para hacer tests
			//console.log(JSON.stringify(tags, null, 4));
			evento_actual.tipo.player1.gainExperienece(evento_actual.tipo.player2)
		}
	}
});

