#!/bin/bash
echo "clone git repo"
cd git
git pull
echo "stop websocket server"
systemctl stop mm-websocket
echo "copy stuff"
cp -fr dist/* /usr/share/nginx/html/
chown http:http /usr/share/nginx/html/ -R
echo "restart websocket server"
systemctl start mm-websocket
echo "done"
