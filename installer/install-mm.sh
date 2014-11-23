#!/bin/bash
# This is the MusicMagnet software installer (MMSI)
# Use this for setting up MusicMagnet on a Raspberry Pi
# =======================================================
# !!! IMPORTANT !!!
# Follow the prerequisites doc before starting!
# !!! IMPORTANT !!!
# =======================================================
# check for root privileges
if [[ $EUID -ne 0 ]]; then
	echo "MMSI: You must be a root user" 2>&1
	exit 1
# startup
echo "MMSI: Only use this on a fresh install!"
echo "Make sure you followed the documatation beforehand!!"
echo "Starting install in 5... (press CTRL+C to cancel)" && sleep 1
echo "4..." && sleep 1
echo "3..." && sleep 1
echo "2..." && sleep 1
echo "1..." && sleep 1
# fix root access
chown root:root /
chmod 755 /
cd /root/
# full update & install software dependencies
echo "MMSI: Installing software dependencies"
pacman --noconfirm -Syu sudo alsa-utils alsa-firmware alsa-plugins fake-hwclock openntpd nginx php-fpm php php-sqlite mplayer vlc hostapd dnsmasq git
# add user "musicmagnet"
echo "MMSI: Adding user"
useradd -m -g users -G wheel http audio -s /bin/bash musicmagnet
# append RAMDisk to /etc/fstab
echo "MMSI: Set RAMDisk"
echo "tmpfs 		/usr/share/nginx/html/server/tmp 	tmpfs	nodev,nosuid,size=256M,uid=33,gid=33 	0 	0" >> /etc/fstab
# pull current software from git
echo "MMSI: Retrieving software"
mkdir musicmagnet-git
git clone https://github.com/MartinKolb1987/mp_ws.git musicmagnet-git
# copy config files (with backup)
echo "MMSI: Copying config files"
# ssh
mv /etc/ssh/sshd_config /etc/ssh/sshd_config.mmsi
cp -f musicmagnet-git/installer/sshd_config /etc/ssh/sshd_config
# hostapd
mv /etc/hostapd/hostapd.conf /etc/hostapd/hostapd.conf.mmsi
cp -f musicmagnet-git/installer/hostapd.conf /etc/hostapd/hostapd.conf
# dnsmasq
mv /etc/dnsmasq.conf /etc/dnsmasq.conf.mmsi
cp -f musicmagnet-git/installer/dnsmasq.conf /etc/dnsmasq.conf
# nginx
mv /etc/nginx/nginx.conf /etc/nginx/nginx.conf.mmsi
cp -f musicmagnet-git/installer/nginx.conf /etc/nginx/nginx.conf
# php
mv /etc/php/php.ini /etc/php/php.ini.mmsi
cp -f musicmagnet-git/installer/php.ini /etc/php/php.ini
# MM Systemd services
cp -f musicmagnet-git/installer/mm-background.service /etc/systemd/system/mm-background.service
cp -f musicmagnet-git/installer/mm-player.service /etc/systemd/system/mm-player.service
cp -f musicmagnet-git/installer/mmm-startup.service /etc/systemd/system/mm-startup.service
cp -f musicmagnet-git/installer/mm-websocket.service /etc/systemd/system/mm-websocket.service
# scripts
cp -f musicmagnet-git/installer/git-pull.sh /root/git-pull.sh
chmod +x /root/git-pull.sh
cp -f musicmagnet-git/installer/git-pull-new.sh /root/git-pull-new.sh
chmod +x /root/git-pull-new.sh
cp -f musicmagnet-git/installer/startup.sh /root/startup.sh
chmod +x /root/startup.sh
cp -f musicmagnet-git/installer/websocket.sh /root/websocket.sh
chmod +x /root/websocket.sh
mkdir /home/musicmagnet/daemons
cp -f musicmagnet-git/installer/background.sh /home/musicmagnet/daemons/background.sh
chmod +x /home/musicmagnet/daemons/background.sh
cp -f musicmagnet-git/installer/musicplayer.sh /home/musicmagnet/daemons/musicplayer.sh
chmod +x /home/musicmagnet/daemons/musicplayer.sh
# provide access for developers (inserting public keys for "root" and "musicmagnet")
# if you don't want this, comment the next two lines (insert # at line start)
cat musicmagnet-git/installer/pubs >> /root/.ssh/authorized_keys
cat musicmagnet-git/installer/pubs >> /home/musicmagnet/.ssh/authorized_keys
# reset permissions in /home/musicmagnet
chown musicmagnet:musicmagnet /home/musicmagnet/ -R
# Systemd services
echo "MMSI: Enable Systemd services"
systemctl enable fake-hwclock fake-hwclock-save.timer openntpd hostapd dnsmasq php-fpm mm-background mm-player mm-startup mm-websocket
# TODO: ssh keygen RSA/ECDSA/ED25519

echo "MMSI: Rebooting in 3 sec"
echo "MMSI: Remember to use ssh port 31337 now (ssh -p 31337)"
sleep 3
reboot
