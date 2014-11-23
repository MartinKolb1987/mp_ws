#!/bin/bash
# =======================================================
# MusicMagnet
# (c) 2014, MusicMagnet
# http://www.condime.de/musicmagnet
# =======================================================
# This is the MusicMagnet startup script
# Executed via Systemd (mm-startup.service)
# It will copy the backup database into the RAMDisk
# =======================================================
cp -p /usr/share/nginx/html/server/db/db.sqlite /usr/share/nginx/html/server/tmp/db.sqlite
