<?php

/* Musicplayer Client Web Service
 * @package musicplayer
 * @author master group mobile experience
 * @version Alpha 1
 */

// path to db (db.php)
// $db_path = '/usr/share/nginx/html/server/tmp/db.sqlite';
$db_path = $_SERVER['DOCUMENT_ROOT'] . '/server/db/db.sqlite';

// path for temp fileupload (client_actions.php)
// $tempPath = '/usr/share/nginx/html/server/tmp/';
$tempPath = '/Applications/XAMPP/xamppfiles/htdocs/mp_ws/tmp';

// path for upload directory (users.php)
$uploadDirectory = $_SERVER['DOCUMENT_ROOT'] . '/server/userdata/';

// path for user data (users.php) -- currently not used???
$truePath = '/usr/share/nginx/html/server/userdata/';

// port and path for websocket (websocket.php)
$websocketPort = 54321;
$websocketHost = 'localhost';

// path for the currently_playing.txt
$currentlyPlayingFilePath = dirname(__FILE__) . '/musicplayer_system_info/currently_playing_track.txt';

?>