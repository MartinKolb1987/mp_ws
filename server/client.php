<?php

/* MusicHive Client Web Service
 * @package musichive
 * @author musichive
 * @version Alpha 1
 */

// send no-cache headers, clients need to verify output every time
header('Cache-Control: no-cache, no-store, max-age=0, must-revalidate');
header('Pragma: no-cache');
header('Expires: Sat, 1 Jan 2000 00:00:00 GMT');

// websocket
$isInitWebSocket = '';
$isInitWebSocket = ($argv[1] == 'ws') ? true : false;

// includes
if($isInitWebSocket){
    // > php -q client.php ws
    require_once('websocket.php');
} else {
    require_once('db/db.php');
    require_once('users.php');
    require_once('tracks.php');
}

/* getClientDataViaWebsocket()
 * get client all data through websocket
 */
function getClientDataViaWebsocket($user, $allUsers, $msg){
  $msg = unwrap($msg);
  $json = json_decode($msg);
  // print $json->type;
  
  // sendDataToClientViaWebsocket($user->socket, $msg);
  // sendDataToClientViaWebsocket($user->socket, '{"ser_vus": "blubb"}');
  // sendDataToClientViaWebsocket($user->socket, '{"musicHiveInfo":{"currentlyPlaying":{"t_id":1,"t_artist":"MUCC","t_title":"1R","t_album":"Houyoku","t_length":225,"u_picture":"","downvote":0},"status":{"users":"30","internet_access":true}}}');
  sendDataToAllClientsViaWebsocket($allUsers, '{"ser_vus": "blubb"}');
}

/* execAction()
 * Determine what to do, depending on client $_POST['type']
 * Rendered output will be text or JSON
 */
function execAction() {
	$action;
    // get action
	try {
		if(empty($_POST['type'])) {
		    // debug mode
		    if(empty($_GET['type'])) {
		        die('error: no action specified (GET/POST type)');
		    } else {
				$action = $_GET['type'];
			}
		} else {
			$action = $_POST['type'];
		}
	} catch(Exception $e) {
		//bla
	}
    
    switch($action){
        case 'uploadTrack':
            // sanity check - empty input
            if (isset($_FILES['file']) == false) {
                die('error: no file specified (execAction() - uploadTrack)');
            } else {
                // return should be true on success
                $returnMsg = uploadFile('track', $_FILES['file']);
                if($returnMsg) {
                    header('Content-type: text/plain');
                    echo 'success';
                }
            }
            break;
        
        case 'removeTrack':
            // sanity check - empty input
            if (empty($_POST['trackId'])) {
                die('error: no id specified (execAction() - removeTrack)');
            } else {
                // return should be true on success
                $returnMsg = deleteTrack($_POST['trackId']);
                if($returnMsg) {
                    header('Content-type: text/plain');
                    echo 'success';
                }
            }
            break;
        
        case 'swapTrack':
            // sanity check - empty input
            if (empty($_POST['trackIds'][0])) {
                die('error: no id specified (execAction() - swapTrack #1)');
            } elseif (empty($_POST['trackIds'][1])) {
                die('error: no id specified (execAction() - swapTrack #2)');
            } else {
                // return should be true on success
                $returnMsg = swapTrack($_POST['trackIds'][0], $_POST['trackIds'][1]);
                if($returnMsg) {
                    header('Content-type: text/plain');
                    echo 'success';
                }
            }
            break;
        
        case 'downvoteTrack':
            // sanity check - empty input
            if (empty($_POST['trackId'])) {
                die('error: no id specified (execAction() - downvoteTrack)');
            } else {
                // return should be true on success
                $returnMsg = insertDownvote($_POST['trackId']);
                if($returnMsg) {
                    header('Content-type: text/plain');
                    echo 'success';
                }
            }
            break;
        
        case 'uploadUserImage':
            // sanity check - empty input
            if (isset($_FILES['file']) == false) {
                die('error: no file or filename specified (execAction() - uploadUserImage)');
            } else {
                // return should be true on success
                $returnMsg = uploadFile('picture', $_FILES['file']);
                if($returnMsg) {
                    header('Content-type: text/plain');
                    echo 'success';
                }
            }
            break;
        
        case 'deletePicture':
            // return should be true on success
            $returnMsg = deletePicture();
            if($returnMsg) {
                header('Content-type: text/plain');
                echo 'success';
            }
            break;
        
        case 'getInfo':
            header('Content-type: application/json');
            getInfo();
            break;
        
        case 'getPlaylist':
            header('Content-type: application/json');
            getUserPlaylist();
            break;
        
        case 'getUserImage':
            header('Content-type: application/json');
            getUserImage();
            break;
    }
}

/* uploadFile()
 * File uploader - tracks and pictures
 * @param String $type 'track' or 'picture', String $file file from HTML5 input form
 * @return Boolean true on success
 */
function uploadFile($type, $file) {
    global $uploadDirectory;
    global $clientIp;
    // list of allowed MIME types
    $allowedFiles = [];
    // size limit in MB
    $sizeLimit = 0;
    
    if($type == 'track') {
        $allowedFiles = ['audio/mpeg', 'audio/x-mpeg', 'audio/x-mpeg-3', 'audio/mp3', 'audio/mp4', 'audio/m4a', 'video/ogg', 'audio/ogg', 'audio/opus', 'audio/vorbis', 'audio/vnd.wav', 'audio/wav', 'audio/x-wav', 'audio/webm', 'audio/aiff', 'audio/x-aiff'];
        $sizeLimit = 100;
    } elseif($type == 'picture') {
        $allowedFiles = ['image/jpeg', 'image/png', 'image/gif'];
        $sizeLimit = 10;
    } else {
        die('error: wrong file upload mode (uploadFile())');
    }
    
    // check file size
	if ($file['size'] > ($sizeLimit * pow(1024, 2))) {
		die('error: file size too big (uploadFile())');
	}
    
    // allowed file type server side check
    $checkFileType = false;
	$fileType = strtolower($file['type']);
	echo('error: DEBUG filetype: '.$fileType);
	if ($fileType == 'application/octet-stream') {
		// dirty hack for missing MIME type from file picker (google chrome / android 4.4)
		$checkFileType = true;
	} else {
		while($allowedFileType = array_pop($allowedFiles)) {
			if($allowedFileType == $fileType) {
				$checkFileType = true;
				break;
			}
		}
	}
    
    if($checkFileType == false) {
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
	if (strpos($fileName, '.') !== false) {
		$fileExt = substr($fileName, strrpos($fileName, '.'));
	} else {
		// dirty hack: on missing file extension, assume .mp3
		$fileExt = '.mp3';
	}
    
    // check against forbidden file extensions
    $forbiddenFileExt = ['php', 'htm', 'exe', 'run', 'bin', 'torrent', 'js', 'css', 'zip', 'rar' , 'sh'];
    while($forbiddenExt = array_pop($forbiddenFileExt)) {
        if (strpos($fileExt, $forbiddenExt) !== false) {
            die('error: forbidden file extension (uploadFile())');
        }
    }
    
    if($type == 'track') {
        // random number for the file
        $randomNo = rand(0, 9999999);
		$tempPath = '/usr/share/nginx/html/server/tmp/';
		$tempFile = $tempPath . $randomNo . $fileExt;
		
		// move file
        if (move_uploaded_file($file['tmp_name'], $tempFile) == false) {
            die('error: moving temp file failed (fileUpload() - audio track - #1)');
        }
		
		// initialize database   
		$db = new ClientDB();
		
		// get metadata from audio file
		$t_artist = $db->escapeString(shell_exec('nice -n 10 mediainfo --Inform="General;%Performer%" "'.$tempFile. '"'));
		$t_title = $db->escapeString(shell_exec('nice -n 10 mediainfo --Inform="General;%Track%" "'.$tempFile. '"'));
		$t_album = $db->escapeString(shell_exec('nice -n 10 mediainfo --Inform="General;%Album%" "'.$tempFile. '"'));
		$t_length = shell_exec('nice -n 10 mediainfo --Inform="General;%Duration/String3%" "'.$tempFile. '"');
		
		// close db
		$db->close();
		unset($db);
	
		$lengthDate = date_parse($t_length);
		$t_length = $lengthDate['hour'] * 3600 + $lengthDate['minute'] * 60 + $lengthDate['second'];
	
		if(strlen($t_title) <= 1) {
			$t_title = $fileName;
		}
		
        // generate new file name
        $newFilePath = $clientIp . '/' . $randomNo . $fileExt;
        // move file
        if (rename($tempFile, ($uploadDirectory . $newFilePath)) == false) {
            die('error: moving temp file failed (fileUpload() - audio track - #2)');
        }
		
        // add to db
        addTrack($newFilePath, $t_artist, $t_title, $t_album, $t_length);
		
    } elseif ($type == 'picture') {
        $newFilePath = $clientIp . '/user' . $fileExt;
        // move file
        if (move_uploaded_file($file['tmp_name'], $uploadDirectory . $newFilePath) == false) {
            die('error: moving temp file failed (fileUpload() - picture)');
        }
        // add to db
        setPicture($newFilePath);
    }
    
    return true;
}


/* getInfo()
 * Render JSON with musicHiveInfo Object
 */
function getInfo() {
    global $clientIp;

    $mainArray = [];
    
    // initialize database   
    $db = new ClientDB();

    // get currently playing track meta data 
    $currentlyPlayingQuery = $db->query("SELECT b.t_id, t.t_artist, t.t_title, t.t_album, t.t_length, u.u_picture FROM bucketcontents b INNER JOIN tracks t ON b.t_id = t.t_id INNER JOIN users u ON t.u_ip = u.u_ip WHERE b.b_currently_playing=1");
    $currentlyPlayingArray = $currentlyPlayingQuery->fetchArray(SQLITE3_ASSOC);
    $currentTrack = $currentlyPlayingArray['t_id'];

	// user downvote check
	if(empty($currentTrack) == false) {
		$userDownvoteCount = 0;
        $userDownvoteQuery = $db->query("SELECT u_ip FROM downvotes WHERE t_id=$currentTrack AND u_ip='$clientIp'");
        while ($row = $userDownvoteQuery->fetchArray(SQLITE3_ASSOC)) {
            $userDownvoteCount++;
        }
		$currentlyPlayingArray['downvote'] = $userDownvoteCount;
	}
    
    // get number of all connected client ips
    $userCount = getActiveUsers();
    
    // get user picture
    $getUserPictureQuery = $db->query("SELECT u_picture FROM users WHERE u_ip = '$clientIp'");
    $getUserPictureArray = $getUserPictureQuery->fetchArray(SQLITE3_ASSOC);
    $userPicture = $getUserPictureArray['u_picture'];
    
    $mainArray['musicHiveInfo'] = array('currentlyPlaying' => $currentlyPlayingArray, 'status' => ['users' => $userCount, 'user_image' => $userPicture, 'internet_access' => 'false']);

    // close db
    $db->close();
    unset($db);
    
    echo json_encode($mainArray);
}


/* getUserPlaylist()
 * Render JSON with musicHivePlaylist Object
 */
function getUserPlaylist() {
    global $clientIp;
    $playlistArray = [];
    
    // initialize database   
    $db = new ClientDB();
    
    $userPlaylistQuery = $db->query("SELECT b.t_id, b.b_id, t.t_artist, t.t_title, t.t_filename, t.t_album, t.t_length FROM bucketcontents b INNER JOIN tracks t ON b.t_id = t.t_id WHERE t.u_ip = '$clientIp' AND b.b_played = 0 ORDER BY b.b_id ASC");
    $userPlaylistArray = [];
    $listEntryCounter = 0;
    
    while ($row = $userPlaylistQuery->fetchArray(SQLITE3_ASSOC)) {
        $listEntryCounter++;
        $userPlaylistArray[(String)$listEntryCounter] = $row;
    }
    
    // close db
    $db->close();
    unset($db);
    
    $playlistArray['musicHivePlaylist'] = $userPlaylistArray;
    
    echo json_encode($playlistArray);
}


/* getUserImage()
 * Render JSON with musicHiveUserImage Object
 */
function getUserImage() {
    global $clientIp;
    
    // initialize database   
    $db = new ClientDB();
    
    $getUserPictureQuery = $db->query("SELECT u_picture FROM users WHERE u_ip = '$clientIp'");
    $getUserPictureArray = $getUserPictureQuery->fetchArray(SQLITE3_ASSOC);
    $userPicture = $getUserPictureArray['u_picture'];
    
    // close db
    $db->close();
    unset($db);
    
    echo json_encode(['musicHiveUserImage' => ['url' => $userPicture]]);
}

if($isInitWebSocket == false){
    execAction();
}


?>
