NW=~/Téléchargements/node-webkit/nw

run: doublons.nw
	$(NW) doublons.nw

doublons.nw: src/*
	cd src && zip -r ../doublons.nw *

clean:
	rm -rf doublons.nw
all: run
