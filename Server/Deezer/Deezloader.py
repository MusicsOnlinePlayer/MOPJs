import deezloader;
import configparser;
import os
import sys, json

def main():
	config = configparser.RawConfigParser();
	path = os.path.join(os.path.dirname(__file__), 'Deezer.properties')

	try:
		config.read(path)
	except Exception as e :
		print(str(e))

	deez = deezloader.Login(config.get('Deezer', 'arl'))

	while 1:
		print('ready', flush=True);
		line = sys.stdin.readline()
		node = json.loads(line);
		if(node["type"] == 1):
			deez.download_trackdee(
				"https://www.deezer.com/en/track/" + str(node["dl"]),
				output = sys.argv[1],
				quality = "MP3_128",
				recursive_quality = False,
				recursive_download = False,
				not_interface = False
			)
			print('end', flush=True);
			


if __name__ == '__main__':
	main()
