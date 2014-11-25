#!/bin/bash
# =======================================================
# MusicMagnet
# (c) 2014, MusicMagnet
# http://www.condime.de/musicmagnet
# =======================================================
# This is the MusicMagnet WebSocket server script
# Executed via Systemd (mm-websocket.service)
# =======================================================
cd /usr/share/nginx/html/server/core
sudo -u http php websocket.php
