
import sys
import time
from gtts import gTTS # Importamos el módulo de TTS
from pygame import mixer  # Importamos el módulo para reproducir sonido

# Funcion playTexto() crea el audio TTS y lo reproduce
#   params:
#     - texto -> Texto a pasar a TTS
#     - lenguage -> El idioma en el que quieres que se cree el TTS
#     - nombre -> Nombre del archivo de salida
#
def playTexto(texto, language = 'es', nombre = 'output'):
    # Generamos el objeto del TTS pasandole los parámetros y desactivando el modo lento
    myobj = gTTS(text=texto, lang=language, slow=False)
    
    # Obtenemos el nombre del archivo de salida
    filename = nombre+".mp3"
    filename = str(filename)

    # Guardamos el archivo generado del TTS
    myobj.save(filename)

    # Iniciamos el motor de audio de pygame
    mixer.pre_init()
    mixer.init()
    mixer.music.load(filename) # Cargamos la cancion
    mixer.music.play()
    time.sleep(2)
    while(mixer.music.get_busy()): # Mientras se este reproduciendo nos quedamos en el while
      continue
    mixer.music.stop() # Cerramos
    exit()  # Salimos

# The text that you want to convert to audio
playTexto(str(sys.argv[1]),nombre = 'final')
  

  
