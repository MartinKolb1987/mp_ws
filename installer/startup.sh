#!/bin/bash
# =======================================================
# MusicMagnet
# (c) 2014, MusicMagnet
# http://www.condime.de/musicmagnet
# =======================================================
# This is the MusicMagnet startup script
# Executed via Systemd (mm-startup.service)
# It will copy the backup database into the RAMDisk,
# set the correct sound output
# and start the serial service
# =======================================================
# analog out
amixer cset numid=3 1 > /dev/null
# HDMI out
#amixer cset numid=3 3 > /dev/null
# full output
amixer sset PCM 95% > /dev/null
# copy database
cp -p /usr/share/nginx/html/server/db/db.sqlite /usr/share/nginx/html/server/tmp/db.sqlite
# run python script
python2 serialservice.py
