/*
    0 = No hay nada
    1 = Juego

*/
var estado = 0;

(function connect(){
    let socket = io.connect('http://localhost:5000')

    // Vuestra visualmente el daño al jugador
    socket.on('take_damage', data => {
        //console.log(data)
        if(estado==1){
            document.getElementById("barra_vida_main").style.width = '260.104' * data.life1 / data.maxlife1;
            document.getElementById("barra_vida_secun").style.width = '260.104' * data.life2 / data.maxlife2;
        }else{
            console.error('No hay juego')
        }
        
    })

    // Carga el juego
    socket.on('change_to_game', data => {
        //console.log(data)
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function(){
            if(xmlhttp.status == 200 && xmlhttp.readyState == 4){
                var txt = xmlhttp.responseText;
                document.body.insertAdjacentHTML('afterbegin',txt)
                document.getElementById("NombreJugadorUno").getElementsByTagName("span")[0].innerHTML = data.evento.tipo.player1.id_player;
                document.getElementById("NombreJugadorDos").getElementsByTagName("span")[0].innerHTML = data.evento.tipo.player2.id_player;

                document.getElementById("FotoJugadorUno").setAttribute("src", data.profile1);
                document.getElementById("FotoJugadorDos").setAttribute("src", data.profile2);

                document.getElementById("NombreJugadorDos_bx").getElementsByTagName("span")[0].innerHTML = 'Nv'+data.evento.tipo.player1.level;
                document.getElementById("NombreJugadorDos_bw").getElementsByTagName("span")[0].innerHTML = 'Nv'+data.evento.tipo.player2.level;

                estado = 1;
            }
        };
        xmlhttp.open("GET",'templates/PokeKoruCombat.ejs',true);
        xmlhttp.send();
        
    })
})()