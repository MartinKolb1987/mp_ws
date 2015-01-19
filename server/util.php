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
$uploadDirectory = getenv("DOCUMENT_ROOT") . '/mp_ws/server/userdata/';
// $uploadDirectory = dirname(__FILE__) . '/userdata/';

// path for user data (users.php) -- currently not used???
$truePath = '/usr/share/nginx/html/server/userdata/';

// port and path for websocket (websocket.php)
$websocketPort = 54321;
$websocketHost = 'localhost';

// musicplayer system info
$currentlyPlayingTrackIdPath = dirname(__FILE__) . '/musicplayer_system_info/currently_playing_track.txt';
$currentlyPlayingDjImagePath = dirname(__FILE__) . '/musicplayer_system_info/currently_playing_dj_image.txt';




/* createTxtFile()
 * needed for is client view up to date
 * read = it‘s faster than sqlite db query
 * @param String $type, String $content
 * @return true on success, false on fail
 */
function createTxtFile($type, $content){
    global $currentlyPlayingTrackIdPath;
    global $currentlyPlayingDjImagePath;

    $path = '';
    
    if($type === 'trackId'){
        $path = $currentlyPlayingTrackIdPath;
    } elseif ($type === 'djImage') {
        $path = $currentlyPlayingDjImagePath;
    }
    
    $msg = file_put_contents($path, $content);
    if($msg !== false){
        return true;
    } else {
        return false;
    }
}

?>