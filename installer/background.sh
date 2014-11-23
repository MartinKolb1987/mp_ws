#!/bin/bash
count=0
while :
do
	if [ "$count" == 2 ]; then
		echo 'backup database'
		sudo nice -n 10 cp -fp /usr/share/nginx/html/server/tmp/db.sqlite /usr/share/nginx/html/server/db/db.sqlite
		count=0
	fi
	echo 'query server for abort'
	abortPlayback=$(wget http://localhost/server/core/player.php?type=abortPlayback -q -O -)
	if [ "$abortPlayback" == 1 ]; then
		echo 'abort playback!'
		sudo killall mplayer
	fi
	sleep 10
	count=`expr $count + 1`
done
