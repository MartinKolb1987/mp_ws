#!/bin/bash
# =======================================================
# MusicMagnet
# (c) 2014, MusicMagnet
# http://www.condime.de/musicmagnet
# =======================================================
# This is the MusicMagnet deployment script (incremental)
# run as root
# =======================================================
echo "clone git repo"
cd /root/musicmagnet-git
git pull
echo "stop websocket server"
systemctl stop mm-websocket
echo "copy stuff"
cp -fr dist/* /usr/share/nginx/html/
chown http:http /usr/share/nginx/html/ -R
echo "restart websocket server"
systemctl start mm-websocket
echo "done"
