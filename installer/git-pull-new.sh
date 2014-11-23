#!/bin/bash
echo "remove old folders"
rm -fr git
rm -fr /usr/share/nginx/html/*
mkdir git
echo "clone git repo"
git clone https://github.com/MartinKolb1987/mp_ws.git git/
echo "stop websocket server"
systemctl stop mm-websocket
echo "copy stuff"
cp -fr dist/* /usr/share/nginx/html/
chown http:http /usr/share/nginx/html/ -R
echo "start websocket server"
systemctl start mm-websocket
echo "done"
