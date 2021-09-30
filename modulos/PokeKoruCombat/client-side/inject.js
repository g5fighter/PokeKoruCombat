var frameElem = null;
const lifeBarSize = '260.104'
const expBarSize = '520'

function cargarVida(evento){
    document.getElementById("barra_vida_main").style.width = lifeBarSize * evento.player1.ps / evento.player1.psBase;
    document.getElementById("barra_vida_secun").style.width = lifeBarSize * evento.player2.ps / evento.player2.psBase;
}

function cargarExp(evento){
    document.getElementById("Exp").style.width = expBarSize * evento.player1.exp / evento.player1.expNivel;
    document.getElementById("Exp_").style.width = expBarSize * evento.player2.exp / evento.player2.expNivel;

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

function loadData(data){
    document.getElementById("NombreJugadorUno").getElementsByTagName("span")[0].innerHTML = data.evento.player1.id_player;
    document.getElementById("NombreJugadorDos").getElementsByTagName("span")[0].innerHTML = data.evento.player2.id_player;

    document.getElementById("FotoJugadorUno").setAttribute("src", data.evento.player1.profile_image);
    document.getElementById("FotoJugadorDos").setAttribute("src", data.evento.player2.profile_image);

    document.getElementById("NombreJugadorDos_bx").getElementsByTagName("span")[0].innerHTML = 'Nv'+data.evento.player1.level;
    document.getElementById("NombreJugadorDos_bw").getElementsByTagName("span")[0].innerHTML = 'Nv'+data.evento.player2.level;

    cargarVida(data.evento)
    cargarExp(data.evento)
}

function take_damage(data){
    cargarVida(data.evento)
    if (data.player != undefined){
        parpadeo(data.player)
    }
}