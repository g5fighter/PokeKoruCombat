// Requires
require('dotenv').config({path: __dirname + '/.env'}) // Configura el archivo de variables de entrono
const express = require('express')
const socketio = require('socket.io')	// Libreria de servidor
const tmi = require('tmi.js');	// Libreria que maneja el chat de Twitch
const { readdirSync } = require('fs')
const fs = require('fs');
const path = require('path');

// Variables globales
const port = 5000	// Puerto que abre el servidor
const channelandusername = process.env['CHANNEL'];	// Canal al que se conecta y usuario que usará el bot
const oauth = process.env['OAUTH_TOKEN']	// Oauth Token tomado desde -> https://twitchapps.com/tmi/
this.eventManager = new (require('./scripts/eventmanager'))(this)
this.ApiTwitch = new (require('./scripts/apitwitch'))(oauth)


// Cargar Modulos
const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

getDirectories('./modulos').forEach(element => {
	fs.readdir('./modulos/'+element, (err, files) => {
		//handling error
		if (err) {
			return console.log('Unable to scan directory: ' + err);
		} 
		//listing all files using forEach
		files.forEach(file => {
			// Do whatever you want to do with the file
			if(file.includes('.js')){
				var module = new (require('./modulos/'+element+'/'+file))(this)
				this.eventManager.loadModule(module)
			}
 
		});
	});
});


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

this.io = socketio(server)

this.io.on('connection', socket => {
    console.log("[Sockets]: Nuevo cliente conectado")
	if(this.eventManager.evento_actual!=null){
		this.eventManager.evento_actual.start(true)
	}
})




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
		/*if(getInclusion(message, '!test')){ // Comando para hacer tests
			//console.log(JSON.stringify(tags, null, 4));
			evento_actual.tipo.player1.gainExperienece(evento_actual.tipo.player2)
			
		}*/
		this.eventManager.modulos.forEach(element => element.tratarMensaje(channel, tags, message, self));
	}
});

