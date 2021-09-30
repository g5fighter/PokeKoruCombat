function executeFunctionByName(functionName, context, args ) {
    var args = Array.prototype.slice.call(arguments, 2);
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    for(var i = 0; i < namespaces.length; i++) {
      context = context[namespaces[i]];
    }
    return context[func].apply(context, args);
  }

 function clearHTML(){
    document.body.innerHTML = ""
}

(function connect(){
    let socket = io.connect('http://localhost:5000')

    socket.on('function', data => {
        console.log('[Function]: Se ha llamado a la funcion -> '+data.funcion)
        executeFunctionByName(data.funcion, window, data);
    })

    socket.on('loadpage', data => {
        var txt = data.html;
        document.body.insertAdjacentHTML('afterbegin',txt)
        var code = data.script
        var s = document.createElement('script');
        s.type = 'text/javascript';
        try {
          s.appendChild(document.createTextNode(code));
          document.body.appendChild(s);
        } catch (e) {
          s.text = code;
          document.body.appendChild(s);
        }

    })
})()