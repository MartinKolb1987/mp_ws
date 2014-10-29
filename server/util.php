<?php

/* Musicplayer Client Web Service
 * @package musicplayer
 * @author master group mobile experience
 * @version Alpha 1
 */

// path to the db (db.php)
// $db_path = '/usr/share/nginx/html/server/tmp/db.sqlite';
$db_path = 'db.sqlite';

// path for temp fileupload (client_actions.php)
$tempPath = '/usr/share/nginx/html/server/tmp/';

// path for the user data (users.php) -- currently not used???
$truePath = '/usr/share/nginx/html/server/userdata/';


// path for the currently_playing.txt
$currentlyPlayingFilePath = dirname(__FILE__) . '/system_info/currently_playing_track.txt';

//websocket localhost port

?>