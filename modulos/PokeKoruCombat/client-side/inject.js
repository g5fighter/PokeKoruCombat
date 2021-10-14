var frameElem = null;
const lifeBarSize = 260.104
const expBarSize = 520

function cargarVida(evento){
    // Buscamos barras
    var barra_vida_main = document.getElementById("barra_vida_main").style
    var barra_vida_secun = document.getElementById("barra_vida_secun").style

    // Cambiamos la vida
    barra_vida_main.width = lifeBarSize * evento.player1.ps / evento.player1.psBase;
    barra_vida_secun.width = lifeBarSize * evento.player2.ps / evento.player2.psBase;

    // Cambiamos el color si tal es el caso
    cambiarColor(barra_vida_main, evento.player1.ps, evento.player1.psBase)
    cambiarColor(barra_vida_secun, evento.player2.ps, evento.player2.psBase)
}

function cambiarColor(barra,actual,base){
    // Cambiamos el color si tal es el caso
    if(actual / base < 1/10){
        barra.fill = "rgb(211, 20, 20,1)";  // Rojo
        //console.log('rojo')
    }else if(actual / base < 1/2){
        barra.fill = "rgb(211, 150, 20,1)"; // Naranja
        //console.log('naranja')
    }else{
        //console.log('verde')
    }
}

function cargarExp(evento){
    document.getElementById("ExpPrincipal").style.width = expBarSize * evento.player1.exp / evento.player1.expNivel;
    document.getElementById("ExpSecundario").style.width = expBarSize * evento.player2.exp / evento.player2.expNivel;

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
        }
      }
}

function loadData(data){
    hideElem("CajaInfo","NombreHolderSecun","NombreHolderMain","FotoJugadorUno","FotoJugadorDos")
    setStartPos(["NombreHolderMain",1930],["NombreHolderSecun",-660])

    document.getElementById("NombreJugadorUno").getElementsByTagName("span")[0].innerHTML = data.evento.player1.id_player;
    document.getElementById("NombreJugadorDos").getElementsByTagName("span")[0].innerHTML = data.evento.player2.id_player;

    document.getElementById("FotoJugadorUno").setAttribute("src", data.evento.player1.profile_image);
    document.getElementById("FotoJugadorDos").setAttribute("src", data.evento.player2.profile_image);

    document.getElementById("NivelJugadorUno").getElementsByTagName("span")[0].innerHTML = 'Nv'+data.evento.player1.level;
    document.getElementById("NivelJugadorDos").getElementsByTagName("span")[0].innerHTML = 'Nv'+data.evento.player2.level;

    cargarVida(data.evento)
    cargarExp(data.evento)
    
    animacionEntrada(data.evento.player1.id_player, data.evento.player2.id_player)
}

function animacionEntrada(player1,player2){
    animacionBasesEntrada(player1,player2);
}

function animacionBasesEntrada(player1,player2){
    var elemSecun = document.getElementById("BaseSecun")
    var elemMain = document.getElementById("BasePrincipal")
    var posSecun = -670;
    var posPrinc = 1950
    clearInterval(frameElem);
    frameElem = setInterval(frame, 1);
    function frame() { 
        if(posSecun>=(1000)){
            clearInterval(frameElem);
            showMessage('<b>'+player1+'</b> reta a <b>'+player2 + '</b> a un combate',4000)
            animacionJugadorEntrada()

        } else {
            posSecun+=5;
            posPrinc-=6.2;
            elemSecun.style.left = posSecun + 'px';
            elemMain.style.left = posPrinc + 'px';
        }
      }
}

function animacionJugadorEntrada(){
    console.log("En parpade")
    var elemMain =  document.getElementById("FotoJugadorUno")
    elemMain.style.display = "block";
    var elemSecun = document.getElementById("FotoJugadorDos");
    elemSecun.style.display = "block";
    var pos = 0;
    clearInterval(frameElem);
    frameElem = setInterval(frame, 1);
    function frame() { 
        if(pos == 100){
            clearInterval(frameElem);
            animacionInfoEntrada()
        } else {
          pos+=2;
          elemMain.style.opacity = pos + '%';
          elemSecun.style.opacity = pos + '%';
        }
      }
}

function animacionInfoEntrada(){
    var elemSecun = document.getElementById("NombreHolderSecun")
    elemSecun.style.display = "block";
    var elemMain = document.getElementById("NombreHolderMain")
    elemMain.style.display = "block";
    var posSecun = -660;
    var posPrinc = 1930
    clearInterval(frameElem);
    frameElem = setInterval(frame, 1);
    function frame() { 
        if(posSecun>=0){
            clearInterval(frameElem);
        } else {
            posSecun+=5;
            posPrinc-=5;
            elemSecun.style.left = posSecun + 'px';
            elemMain.style.left = posPrinc + 'px';
        }
      }
}

function hideElem(){
    for (var i = 0; i < arguments.length; i++) {
        document.getElementById(arguments[i]).style.display = "none";
      }
    
}

function setStartPos(){
    for (var i = 0; i < arguments.length; i++) {
        document.getElementById(arguments[i][0]).style.left = arguments[i][1];
      }
    
}

function showMessage(message, time){
    document.getElementById("CajaInfo").style.display = "block";
    document.getElementById("TextoCajaInfo").getElementsByTagName("span")[0].innerHTML = message;
    setTimeout(() => {  hideElem("CajaInfo"); }, time);
}

function take_damage(data){
    cargarVida(data.evento)
    if (data.player != undefined){
        parpadeo(data.player)
        showMessage(data.message,4000)
    }
}