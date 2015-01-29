#!/bin/bash
# =======================================================
# MusicMagnet
# (c) 2014, MusicMagnet
# http://www.condime.de/musicmagnet
# =======================================================
# This is the MusicMagnet software installer (MMSI)
# It installs MusicMagnet on a Raspberry Pi (B/B+) with Arch Linux
# =======================================================
# !!! IMPORTANT !!!
# Follow the prerequisites doc before starting!
# !!! IMPORTANT !!!
# =======================================================
# check for root privileges
if [[ $EUID -ne 0 ]]; then
	echo "You must be a root user to run this installer!" 2>&1
	exit 1
fi
# startup
echo "================== MMSI =================="
echo "Only use this on a fresh install. It can work on existing installs,"
echo "but it also might destroy your system configuration :-)"
echo "Make sure you followed the documatation beforehand!!"
echo "=========================================="
echo "Starting install in 5... (press CTRL+C to cancel)" && sleep 1
echo "4..." && sleep 1
echo "3..." && sleep 1
echo "2..." && sleep 1
echo "1..." && sleep 1
# fix root access (fresh SD bug)
chown root:root /
chmod 755 /
cd /root/
# full update & install software dependencies
echo "================== MMSI =================="
echo "Installing software dependencies"
echo "=========================================="
pacman --noconfirm -Syu sudo wget alsa-utils alsa-firmware alsa-plugins fake-hwclock openntpd nginx php-fpm php php-sqlite mplayer vlc hostapd dnsmasq git mediainfo python2 python2-pip
# install python pyserial library
pip2 install pyserial
# add user "musicmagnet"
echo "================== MMSI =================="
echo "Adding user 'musicmagnet'"
echo "=========================================="
useradd -m -G wheel,http,audio,users -s /bin/bash musicmagnet
# append RAMDisk to /etc/fstab
echo "================== MMSI =================="
echo "Set RAMDisk in /etc/fstab"
echo "=========================================="
tmpfsString="tmpfs /usr/share/nginx/html/server/tmp tmpfs nodev,nosuid,size=256M,uid=33,gid=33 0 0"
if grep -Fxq "$tmpfsString" '/etc/fstab';
then
	echo "*** already in fstab ***"
else
	echo "*** writing to fstab ***"
	echo $tmpfsString >> /etc/fstab
fi
# pull current software from git
echo "================== MMSI =================="
echo "Retrieving MusicMagnet software"
echo "=========================================="
rm -r musicmagnet-git
mkdir musicmagnet-git
git clone https://github.com/MartinKolb1987/mp_ws.git musicmagnet-git
# copy config files (with backup)
echo "================== MMSI =================="
echo "Copying config files"
echo "=========================================="
# ssh
mv -f /etc/ssh/sshd_config /etc/ssh/sshd_config.mmsi
cp -f musicmagnet-git/installer/sshd_config /etc/ssh/sshd_config
# hostapd
mv -f /etc/hostapd/hostapd.conf /etc/hostapd/hostapd.conf.mmsi
cp -f musicmagnet-git/installer/hostapd.conf /etc/hostapd/hostapd.conf
# dnsmasq
mv -f /etc/dnsmasq.conf /etc/dnsmasq.conf.mmsi
cp -f musicmagnet-git/installer/dnsmasq.conf /etc/dnsmasq.conf
# nginx
mv -f /etc/nginx/nginx.conf /etc/nginx/nginx.conf.mmsi
cp -f musicmagnet-git/installer/nginx.conf /etc/nginx/nginx.conf
# php
mv -f /etc/php/php.ini /etc/php/php.ini.mmsi
cp -f musicmagnet-git/installer/php.ini /etc/php/php.ini
# MM Systemd services
cp -f musicmagnet-git/installer/mm-background.service /etc/systemd/system/mm-background.service
cp -f musicmagnet-git/installer/mm-player.service /etc/systemd/system/mm-player.service
cp -f musicmagnet-git/installer/mm-startup.service /etc/systemd/system/mm-startup.service
cp -f musicmagnet-git/installer/mm-websocket.service /etc/systemd/system/mm-websocket.service
# wlan0 network services
#TODO
mkdir 
# scripts
cp -f musicmagnet-git/installer/git-pull.sh /root/git-pull.sh
chmod +x /root/git-pull.sh
cp -f musicmagnet-git/installer/git-pull-new.sh /root/git-pull-new.sh
chmod +x /root/git-pull-new.sh
cp -f musicmagnet-git/installer/startup.sh /root/startup.sh
chmod +x /root/startup.sh
cp -f musicmagnet-git/installer/serialservice.py /root/serialservice.py
chmod +x /root/serialservice.py
cp -f musicmagnet-git/installer/websocket.sh /root/websocket.sh
chmod +x /root/websocket.sh
mkdir /home/musicmagnet/daemons
cp -f musicmagnet-git/installer/background.sh /home/musicmagnet/daemons/background.sh
chmod +x /home/musicmagnet/daemons/background.sh
cp -f musicmagnet-git/installer/musicplayer.sh /home/musicmagnet/daemons/musicplayer.sh
chmod +x /home/musicmagnet/daemons/musicplayer.sh
# provide access for developers (inserting public keys for "root" and "musicmagnet")
# if you don't want this, comment the following lines (insert # at line start)
mkdir /root/.ssh
cat musicmagnet-git/installer/pubs >> /root/.ssh/authorized_keys
mkdir /home/musicmagnet/.ssh
cat musicmagnet-git/installer/pubs >> /home/musicmagnet/.ssh/authorized_keys
# reset permissions in /home/musicmagnet
chown musicmagnet:musicmagnet /home/musicmagnet/ -R
# Systemd services
echo "================== MMSI =================="
echo "Enable Systemd services"
echo "=========================================="
systemctl enable fake-hwclock fake-hwclock-save.timer openntpd hostapd dnsmasq php-fpm mm-background mm-player mm-startup mm-websocket
echo "================== MMSI =================="
echo "Disable Systemd log (journald) and copy corrected services"
echo "=========================================="
systemctl disable systemd-journald systemd-journald.socket systemd-journald-dev-log.socket
# copy changed Systemd services (with correct niceness)
cp -f musicmagnet-git/installer/nginx.service /etc/systemd/system/multi-user.target.wants/nginx.service
cp -f musicmagnet-git/installer/hostapd.service /etc/systemd/system/multi-user.target.wants/hostapd.service
cp -f musicmagnet-git/installer/php-fpm.service /etc/systemd/system/multi-user.target.wants/php-fpm.service
cp -f musicmagnet-git/installer/dnsmasq.service /etc/systemd/system/multi-user.target.wants/dnsmasq.service
echo "================== MMSI =================="
echo "Rebooting in 3 sec"
echo "Remember to use ssh port 31337 now (ssh -p 31337)"
echo "=========================================="
sleep 3
reboot
