#!/bin/bash
#sudo cp -f /usr/share/nginx/html/server/db/db.sqlite /usr/share/nginx/html/server/db/tmp/db.sqlite
function playMusic {
	trackToPlay=$(wget http://localhost/server/core/player.php?type=getTrack -q -O -)
	echo "got file path $trackToPlay from server"
	if [ "$trackToPlay" == "empty" ]; then
		echo "no track to play, sleep 5"
		sleep 5
		playMusic
	else
		echo "playing $trackToPlay"
		sudo -u mplayer nice -n -10 mplayer /usr/share/nginx/html/server/userdata/$trackToPlay -ao alsa -af volnorm=2:0.50 -cache 102400 -cache-min 99
		echo "finished playing $trackToPlay, call playbackFinished"
		playbackFinished $trackToPlay
	fi
}

function playbackFinished {
	successMessage=$(wget http://localhost/server/core/player.php?type=playbackFinished\&filename=$1 -q -O -)
	if [ "$successMessage" != 1 ]; then
		echo "something wrong, try again"
		sleep 1
		playbackFinished $1
	else
		playMusic
	fi
}

playMusic
