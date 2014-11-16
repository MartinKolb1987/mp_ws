<?php

// includes
require_once('../db/db.php');
require_once('../util.php');
require_once('admin.php');
require_once('users.php');

/* uploadFile()
 * File uploader - tracks and pictures
 * @param String $type 'track' or 'picture', String $file file from HTML5 input form
 * @return Boolean true on success
 */
function uploadFile($type, $file, $route){
    global $uploadDirectory;
    global $clientIp;
    global $tempPath;

    // list of allowed MIME types
    $allowedFiles = [];
    // size limit in MB
    $sizeLimit = 0;
    
    if($type == 'uploadUserTrack'){
        $allowedFiles = ['audio/mpeg', 'audio/x-mpeg', 'audio/x-mpeg-3', 'audio/mp3', 'audio/mp4', 'audio/m4a', 'video/ogg', 'audio/ogg', 'audio/opus', 'audio/vorbis', 'audio/vnd.wav', 'audio/wav', 'audio/x-wav', 'audio/webm', 'audio/aiff', 'audio/x-aiff'];
        $sizeLimit = 100;
    } elseif($type == 'uploadUserImage'){
        $allowedFiles = ['image/jpeg', 'image/png', 'image/gif'];
        $sizeLimit = 10;
    } else {
        die('error: wrong file upload mode (uploadFile())');
    }
    
    // check file size
    if ($file['size'] > ($sizeLimit * pow(1024, 2))){
        die('error: file size too big (uploadFile())');
    }
    
    // allowed file type server side check
    $checkFileType = false;
    $fileType = strtolower($file['type']);

    if ($fileType == 'application/octet-stream'){
        // dirty hack for missing MIME type from file picker (google chrome / android 4.4)
        $checkFileType = true;
    } else {
        while($allowedFileType = array_pop($allowedFiles)){
            if($allowedFileType == $fileType){
                $checkFileType = true;
                break;
            }
        }
    }
    
    if($checkFileType == false){
        die('error: file type does not match (uploadFile())');
    }
    
    // initialize database   
    $db = new ClientDB();
    
    // get file name and extention
    $fileName = $db->escapeString(strtolower($file['name']));
    
    // close db
    $db->close();
    unset($db);
    
    $fileExt;
    // check if filename has an extension (contains dot)
    if (strpos($fileName, '.') !== false){
        $fileExt = substr($fileName, strrpos($fileName, '.'));
    } else {
        // dirty hack: on missing file extension, assume .mp3
        $fileExt = '.mp3';
    }
    
    // check against forbidden file extensions
    $forbiddenFileExt = ['php', 'htm', 'exe', 'run', 'bin', 'torrent', 'js', 'css', 'zip', 'rar' , 'sh'];
    while($forbiddenExt = array_pop($forbiddenFileExt)){
        if (strpos($fileExt, $forbiddenExt) !== false){
            die('error: forbidden file extension (uploadFile())');
        }
    }
    
    if($type == 'uploadUserTrack'){
        // random number for the file
        $randomNo = rand(0, 9999999);
        // $tempPath = '/usr/share/nginx/html/server/tmp/';
        $tempFile = $clientIp . '/tracks/' . $randomNo . $fileExt;
        
        // move file
        if (move_uploaded_file($file['tmp_name'], $uploadDirectory . $tempFile) == false){
            die('error: moving temp file failed (fileUpload() - audio track - #1)');
        }
        
        // initialize database   
        $db = new ClientDB();
        
        // get metadata from audio file
        // $t_artist = $db->escapeString(shell_exec('nice -n 10 mediainfo --Inform="General;%Performer%" "' . $tempFile . '"'));
        // $t_title = $db->escapeString(shell_exec('nice -n 10 mediainfo --Inform="General;%Track%" "' . $tempFile . '"'));
        // $t_album = $db->escapeString(shell_exec('nice -n 10 mediainfo --Inform="General;%Album%" "' . $tempFile . '"'));
        // $t_length = exec('nice -n 10 mediainfo --Inform="Audio;%Duration%" /opt/lampp/htdocs/mp_ws/server/userdata/127.0.0.1/tracks/3118767.mp3');

        $t_artist = 'Artist' . $randomNo;
        $t_title = 'Title' . $randomNo;
        $t_album = 'Album' . $randomNo;
        $t_length = $randomNo;
        
        // close db
        $db->close();
        unset($db);
    
        $lengthDate = date_parse($t_length);
        $t_length = $lengthDate['hour'] * 3600 + $lengthDate['minute'] * 60 + $lengthDate['second'];
    
        if(strlen($t_title) <= 1) {
            $t_title = $fileName;
        }
        
        // // generate new file name
        // $newFilePath = $clientIp . '/' . $randomNo . $fileExt;
        // // move file
        // if (rename($tempFile, ($uploadDirectory . $newFilePath)) == false) {
        //     die('error: moving temp file failed (fileUpload() - audio track - #2)');
        // }
        
        // add to db
        addTrack($tempFile, $t_artist, $t_title, $t_album, $t_length);

        getUserPlaylist($route, $type, $clientIp);
        
        // return '{"route":"' .  $route . '", "type": "' . $type . '","title": "' . $t_title . '"}}';
        return true;
        
    } elseif ($type == 'uploadUserImage') {
        // random number for the file
        $randomNo = rand(0, 9999999);
        $newFilePath = $clientIp . '/images/' . $randomNo . $fileExt;

        // move file
        if (move_uploaded_file($file['tmp_name'], $uploadDirectory . $newFilePath) == false) {
            die('error: moving temp file failed (fileUpload() - picture)');
        }

        // add to db
        $path = setPicture($newFilePath);
        $wholeImagePath = '../server/userdata/'. $path;

        // write currently playing track id into txt
        // no db used, because of the high request rate during "is user view up to date"
        $createTxtFile = createTxtFile('djImage', $wholeImagePath);

        return '{"route":"' .  $route . '", "type": "' . $type . '","userImage":{"url":"' . $wholeImagePath . '"}}';
    }
    
}


/* getCurrentlyPlaying()
 * Render JSON with musicSystemInfo Object
 */
function getCurrentlyPlaying($route, $type, $websocketClientIp = '') {
    global $clientIp;
    $mainArray = [];

    // take client ip from websocket
    if(empty($websocketClientIp) === false){
        $clientIp = $websocketClientIp;
    }
    
    // initialize database   
    $db = new ClientDB();

    // get currently playing track meta data 
    $currentlyPlayingQuery = $db->query("SELECT b.t_id, t.t_artist, t.t_title, t.t_album, t.t_length, u.u_picture FROM bucketcontents b INNER JOIN tracks t ON b.t_id = t.t_id INNER JOIN users u ON t.u_ip = u.u_ip WHERE b.b_currently_playing=1");
    $currentlyPlayingArray = $currentlyPlayingQuery->fetchArray(SQLITE3_ASSOC);
    $currentTrack = $currentlyPlayingArray['t_id'];
    $currentArtist = $currentlyPlayingArray['t_artist'];
    $currentTitle = $currentlyPlayingArray['t_title'];
    $currentAlbum = $currentlyPlayingArray['t_album'];
    $currentLength = $currentlyPlayingArray['t_length'];

    // user downvote check
    if(empty($currentTrack) == false) {
     $userDownvoteCount = 0;
        $userDownvoteQuery = $db->query("SELECT u_ip FROM downvotes WHERE t_id=$currentTrack AND u_ip='$clientIp'");
        while ($row = $userDownvoteQuery->fetchArray(SQLITE3_ASSOC)) {
            $userDownvoteCount++;
        }
        $currentlyPlayingDownvote = $userDownvoteCount;
    }
    
    // get number of all connected client ips
    $userCount = getActiveUsers();
    
    // get user picture
    $getUserPictureQuery = $db->query("SELECT u_picture FROM users WHERE u_ip = '$clientIp' LIMIT 1");
    $getUserPictureArray = $getUserPictureQuery->fetchArray(SQLITE3_ASSOC);
    $userPicture = $getUserPictureArray['u_picture'];
    $userPicture = '../server/userdata/'. $userPicture;

    // get internet access
    $getInternetAccess = $db->query("SELECT a_internet_access FROM admins");
    $getInternetAccess = $getInternetAccess->fetchArray(SQLITE3_ASSOC);
    $getInternetAccess = $getInternetAccess['a_internet_access'];
    if(empty($getInternetAccess)){ $getInternetAccess = 0; }

    // close db
    $db->close();
    unset($db);
    
    if(empty($currentTrack) === false){
        // track is playing
        return '{"route":"' .  $route . '", "type": "' . $type . '","info":{"currentlyPlaying":{"id":' . $currentTrack . ',"artist":"' . $currentArtist . '","title":"' . $currentTitle . '","album":"' . $currentAlbum . '","length":' . $currentLength . ',"image":"' . $userPicture . '","downvote":' . $currentlyPlayingDownvote . '},"status":{"users":"' . $userCount . '","internetAccess":' . $getInternetAccess . '}}}';
    } else {
        // show no track is playing
        return '{"route":"' .  $route . '", "type": "' . $type . '","info":{"currentlyPlaying":{"id":-1,"artist":"no artist","title":"no title","album":"no album","length":0,"image":"../server/userdata/default.png","downvote":0},"status":{"users":"' . $userCount . '","internetAccess":' . $getInternetAccess . '}}}';
    }
}


/* getUserPlaylist()
 * Render JSON with playlist Object
 */
function getUserPlaylist($route, $type, $websocketClientIp = '') {
    global $clientIp;

    // take client ip from websocket
    if(empty($websocketClientIp) === false){
        $clientIp = $websocketClientIp;
    }

    $playlistArray = [];    

    // initialize database   
    $db = new ClientDB();
    
    $userPlaylistQuery = $db->query("SELECT b.t_id, t.t_artist, t.t_title FROM bucketcontents b INNER JOIN tracks t ON b.t_id = t.t_id WHERE t.u_ip = '$clientIp' AND b.b_played = 0 ORDER BY b.b_id ASC");
    $userPlaylistArray = [];
    $listEntryCounter = 0;

    while ($row = $userPlaylistQuery->fetchArray(SQLITE3_ASSOC)) {
        $listEntryCounter++;
        $userPlaylistArray[(String)$listEntryCounter] = $row;
    }
    
    // close db
    $db->close();
    unset($db);
    
    return '{"route": "' .  $route . '", "type": "' . $type . '", "playlist": ' . json_encode($userPlaylistArray) . '}';
}


/* getUserImage()
 * Render JSON with image Object
 */
function getUserImage($route, $type, $websocketClientIp = '') {
    global $clientIp;

    // take client ip from websocket
    if(empty($websocketClientIp) === false){
        $clientIp = $websocketClientIp;
    }

    // initialize database
    $db = new ClientDB();

    $getUserPictureQuery = $db->query("SELECT u_picture FROM users WHERE u_ip = '$clientIp'");
    $getUserPictureArray = $getUserPictureQuery->fetchArray(SQLITE3_ASSOC);
    $userPicture = $getUserPictureArray['u_picture'];

    // close db
    $db->close();
    unset($db);
    
    return '{"route":"' .  $route . '", "type": "' . $type . '","userImage":{"url":"../server/userdata/' . $userPicture . '"}}';
}


/* getCurrentMusicplayerInfo()
 * triggert from auto update mechanism
 * decide which data is maybe needed (client side)
 */
function getCurrentMusicplayerInfo($route, $type, $websocketClientIp = ''){
    global $clientIp;
    global $startTrackId;
    global $currentlyPlayingTrackIdPath;
    global $currentlyPlayingDjImagePath;

    // take client ip from websocket
    if(empty($websocketClientIp) === false){
        $clientIp = $websocketClientIp;
    }
  
    $content = '';
    $trackId = '';
    $djImage = '';

    if($route === 'home'){

        // if txt files dont exists
        // --> create them
        if(file_exists($currentlyPlayingTrackIdPath) === false || file_exists($currentlyPlayingDjImagePath) === false){
            $crtTxtFile = createTxtFile('trackId', $startTrackId); 
            chmod($currentlyPlayingTrackIdPath, 0777);
            $crtTxtFile = createTxtFile('djImage', '../server/userdata/default.png');
            chmod($currentlyPlayingDjImagePath, 0777);
        }
        
        // get currently playing music track id
        $trackId = file_get_contents($currentlyPlayingTrackIdPath);
        // get currently playing dj image
        $djImage = file_get_contents($currentlyPlayingDjImagePath);

        $content = '{"route":"' .  $route . '", "type": "' . $type . '","currentlyPlayingTrackId": ' . $trackId . ', "currentlyPlayingDjImage": "' . $djImage . '"}';
    }

    return $content;
}

?>
