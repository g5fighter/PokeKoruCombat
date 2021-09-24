module.exports = class ApiTwitch{
    
    constructor(oauth){
        this.clientTwitchToken = null
        // Obtención de credenciales para Twitch
        this.getTwitchCredentials(oauth).then((token) => {
            this.clientTwitchToken = token
        })
    }



    /**
     * Funcion que obtiene las credenciales del cliente de Twitch
     * @param {*} oauth 
     * @returns 
     */
     getTwitchCredentials(oauth){
        return new Promise((resolve, reject) => {
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
     * Devuelve los nombres de los usurios dados, si estos existen
     * @param {*} users 
     * @returns 
     */
    getUser(users){
        return new Promise((resolve, reject) => {
        var url = "https://api.twitch.tv/kraken/users?login=";
        users.forEach(element => (url += element + ","));
        url = url.substring(0, url.length-1);

        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        
        xhr.setRequestHeader("Accept", "application/vnd.twitchtv.v5+json");
        xhr.setRequestHeader("Client-ID",this.clientTwitchToken);

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
     * Funcion que devuelve las imagenes de perfil de los usuarios dados
     * @param {*} users 
     * @returns 
     */
     getProfileImage(users){
         console.log('[ApiTwitch]: Tratando de obtener imagen de perfil')
        return new Promise((resolve, reject) => {
        var url = "https://api.twitch.tv/kraken/users?login=";
        users.forEach(element => (url += element + ","));
        url = url.substring(0, url.length-1);

        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        
        xhr.setRequestHeader("Accept", "application/vnd.twitchtv.v5+json");
        xhr.setRequestHeader("Client-ID",this.clientTwitchToken);

        xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            const obj = JSON.parse(xhr.responseText);
            if(users[0] == obj['users'][0]['name']){
                resolve([obj['users'][0]['logo'],obj['users'][1]['logo']]);
            }else{
                resolve([obj['users'][1]['logo'],obj['users'][0]['logo']]);
            }
            console.log('[ApiTwitch]: Imagen obtenida')
        }};

        xhr.send();
    });	
    }

    getClipLink(user, random = false, last = false){
        return new Promise((resolve, reject) => {
        var url = "https://api.twitch.tv/kraken/clips/top";
        if(user!=undefined){
            url+='?channel='+user
        }
    
        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        
        xhr.setRequestHeader("Accept", "application/vnd.twitchtv.v5+json");
        xhr.setRequestHeader("Client-ID",this.clientTwitchToken);
        xhr.setRequestHeader("channel",user);
    
    
        xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            const obj = JSON.parse(xhr.responseText);
            var clip = 0;
            if(random){
                clip = Math.floor(Math.random() * obj['clips'].length);
            }
            console.log('https://clips-media-assets2.twitch.tv/'+obj['clips'][clip]['thumbnails']['medium'].split('.tv/')[1].split('-preview-')[0]+'.mp4')
        }};
    
        xhr.send();
    });	
    }
    
}