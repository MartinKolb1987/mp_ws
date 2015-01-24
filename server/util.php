<?php

/* Musicplayer Client Web Service
 * @package musicplayer
 * @author master group mobile experience
 * @version Alpha 1
 */

// path to db (db.php)
// $db_path = '/usr/share/nginx/html/server/tmp/db.sqlite';
// $db_path = $_SERVER['DOCUMENT_ROOT'] . '/mp_ws/server/db/db.sqlite';
$db_path = dirname(__FILE__) . '/db/db.sqlite';

// path for temp fileupload (client_actions.php)
$tempPath = '/usr/share/nginx/html/server/tmp/';

// path for upload directory (users.php)
// $uploadDirectory = getenv("DOCUMENT_ROOT") . '/mp_ws/server/userdata/';
$uploadDirectory = dirname(__FILE__) . '/userdata/';

// path for user data (users.php) -- currently not used???
$truePath = '/usr/share/nginx/html/server/userdata/';

// port and path for websocket (websocket.php)
$websocketPort = 54321;
$websocketHost = 'localhost';

?>