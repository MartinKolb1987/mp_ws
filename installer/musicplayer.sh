#!/bin/bash
# =======================================================
# MusicMagnet
# (c) 2014, MusicMagnet
# http://www.condime.de/musicmagnet
# =======================================================
# This is the MusicMagnet player daemon
# Executed via Systemd (mm-player.service)
# with highest priority (nice -19)
# =======================================================
function playMusic {
	trackToPlay=$(wget http://localhost/server/core/player.php?type=getTrack -q -O -)
	echo "got file path $trackToPlay from server"
	if [ "$trackToPlay" == "empty" ]; then
		echo "no track to play, sleep 5"
		sleep 5
		playMusic
	else
		echo "playing $trackToPlay"
		sudo -u musicmagnet mplayer /usr/share/nginx/html/server/tmp/$trackToPlay -ao alsa -af volnorm=2:0.50
		echo "finished playing $trackToPlay, call playbackFinished"
		playbackFinished $trackToPlay
	fi
}

function playbackFinished {
	successMessage=$(wget http://localhost/server/core/player.php?type=playbackFinished -q -O -)
	if [ "$successMessage" != 1 ]; then
		echo "something wrong, try again"
		sleep 1
		playbackFinished $1
	else
		playMusic
	fi
}

playMusic
