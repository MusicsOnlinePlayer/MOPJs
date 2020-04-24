import deezloader;
import configparser;
import os
import sys

config = configparser.RawConfigParser();
path = os.path.join(os.path.dirname(__file__), 'Deezer.properties')

try:
    config.read(path)
except Exception as e :
    print(str(e))

deez = deezloader.Login(config.get('Deezer', 'arl'))

outpath = deez.download_trackdee(
	"https://www.deezer.com/en/track/" + sys.argv[1],
	output = sys.argv[2],
	quality = "MP3_128",
	recursive_quality = False,
	recursive_download = False,
	not_interface = False
)

sys.stdout.write(outpath);
sys.stdout.flush();
sys.exit(0);