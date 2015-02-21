NWPATH=~/Téléchargements/node-webkit/
NW=$(NWPATH)/nw
NWEXE=$(NWPATH)/windows/nw.exe

run: doublons.nw
	$(NW) doublons.nw

doublons.exe: doublons.nw
	cat "$(NW)/windows/nw.exe" doublons.nw > doublons.exe

doublons.nw: src/*
	cd src && zip -r ../doublons.nw *
tests:
	mkdir tests && touch tests/bonjour.avi tests/bonjourno.mkv tests/le.nez.mkv tests/le\ nez.avi
clean:
	rm -rf doublons.nw
all: run
