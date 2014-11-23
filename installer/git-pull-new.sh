#!/bin/bash
# =======================================================
# MusicMagnet
# (c) 2014, MusicMagnet
# http://www.condime.de/musicmagnet
# =======================================================
# This is the MusicMagnet deployment script (full)
# run as root
# =======================================================
echo "remove old folders"
rm -fr /root/musicmagnet-git
rm -fr /usr/share/nginx/html/*
echo "clone git repo"
cd /root/
mkdir musicmagnet-git
git clone https://github.com/MartinKolb1987/mp_ws.git musicmagnet-git
echo "stop websocket server"
systemctl stop mm-websocket
echo "copy stuff"
cp -fr dist/* /usr/share/nginx/html/
chown http:http /usr/share/nginx/html/ -R
echo "start websocket server"
systemctl start mm-websocket
echo "done"
