/*
    0 = No hay nada
    1 = Juego

*/
var estado = 0;
var id = -1;
var frameElem = null;
const lifeBarSize = '260.104'
const expBarSize = '520'

function clearHTML(){
    document.body.innerHTML = ""
}

function cargarVida(evento){
    document.getElementById("barra_vida_main").style.width = lifeBarSize * evento.tipo.player1.ps / evento.tipo.player1.psBase;
    document.getElementById("barra_vida_secun").style.width = lifeBarSize * evento.tipo.player2.ps / evento.tipo.player2.psBase;
}

function cargarExp(evento){
    document.getElementById("Exp").style.width = expBarSize * evento.tipo.player1.exp / evento.tipo.player1.expNivel;
    document.getElementById("Exp_").style.width = expBarSize * evento.tipo.player2.exp / evento.tipo.player2.expNivel;

}

function parpadeo(player){
    console.log("En parpade")
    var elem = player == 0 ? document.getElementById("FotoJugadorUno") : document.getElementById("FotoJugadorDos");
    var pos = 100;
    var ida = -1
    clearInterval(frameElem);
    frameElem = setInterval(frame, 1);
    function frame() { 
        if(ida == -1 && pos < 25){
            ida = 1
        }else if(ida==1 && pos == 100){
            clearInterval(frameElem);
        } else {
          pos+=ida;
          elem.style.opacity = pos + '%';
          elem.style.opacity = pos + '%';
        }
      }
}

(function connect(){
    let socket = io.connect('http://localhost:5000')

    // Recibe el estado actual del juego
    socket.on('take_damage', data => {
        if(estado==1){
            cargarVida(data.evento)
            if (data.player != undefined){
                parpadeo(data.player)
            }
        }else{
            console.error('No hay juego')
        }
        
    })

    socket.on('deblitado', data => {

        clearHTML()
        
    })

    // Carga el juego
    socket.on('change_to_game', data => {
        console.log('[change_to_game]: Entro en change to game')
        if(data.firstTime==true){
            if(id!=data.evento.id){
                clearHTML()
            }else{
                return
            }

        }
        id = data.evento.id
        //console.log(data)
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function(){
            if(xmlhttp.status == 200 && xmlhttp.readyState == 4){
                var txt = xmlhttp.responseText;
                document.body.insertAdjacentHTML('afterbegin',txt)
                document.getElementById("NombreJugadorUno").getElementsByTagName("span")[0].innerHTML = data.evento.player1.id_player;
                document.getElementById("NombreJugadorDos").getElementsByTagName("span")[0].innerHTML = data.evento.player2.id_player;

                document.getElementById("FotoJugadorUno").setAttribute("src", data.player1.profile_image);
                document.getElementById("FotoJugadorDos").setAttribute("src", data.player2.profile_image);

                document.getElementById("NombreJugadorDos_bx").getElementsByTagName("span")[0].innerHTML = 'Nv'+data.evento.player1.level;
                document.getElementById("NombreJugadorDos_bw").getElementsByTagName("span")[0].innerHTML = 'Nv'+data.evento.player2.level;

                cargarVida(data.evento)
                cargarExp(data.evento)
                estado = 1;
            }
        };
        xmlhttp.open("GET",'templates/PokeKoruCombat.ejs',true);
        xmlhttp.send();
        
    })
})()