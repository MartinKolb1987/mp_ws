<?php

/* Musicplayer Client Web Service
 * @package musicplayer
 * @author master group mobile experience
 * @version Alpha 1
 */

// send no-cache headers, clients need to verify output every time
header('Cache-Control: no-cache, no-store, max-age=0, must-revalidate');
header('Pragma: no-cache');
header('Expires: Sat, 1 Jan 2000 00:00:00 GMT');

// includes
require_once('../db/db.php');
require_once('users.php');
$clientIp = getClientIP();
require_once('tracks.php');
require_once('client_actions.php');

/* execAction()
 * Determine what to do, depending on client $_POST['type']
 * Rendered output will be text or JSON
 */
function execAction() {
	$type;
    $route = $_POST['route'];
    $sendData = $_POST['data'];

    // get action
	try {
		if(empty($_POST['type'])) {
		    // debug mode
		    if(empty($_GET['type'])) {
		        die('error: no action specified (GET/POST type)');
		    } else {
				$type = $_GET['type'];
			}
		} else {
			$type = $_POST['type'];
		}
	} catch(Exception $e) {
		// no type defined
	}
    
    switch($type){
        case 'checkUser':
            checkUser();
            break;

        case 'uploadUserTrack':
            // sanity check - empty input
            if (isset($_FILES['file']) == false) {
                die('error: no file specified (execAction() - uploadUserTrack)');
            } else {
                // return should be true on success
                $returnMsg = uploadFile($type, $_FILES['file'], $route);
                if(!empty($returnMsg)) {
                    header('Content-type: text/plain');
                    echo $returnMsg;
                }
            }
            break;
        
        case 'deleteUserTrack':
            // sanity check - empty input
            if (empty($sendData)) {
                die('error: no id specified (execAction() - removeTrack)');
            } else {
                // return should be true on success
                $returnMsg = deleteUserTrack($route, $type, $sendData);
                if(!empty($returnMsg)) {
                    header('Content-type: application/json');
                    echo $returnMsg;
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
            if (empty($sendData)) {
                die('error: no id specified (execAction() - downvoteTrack)');
            } else {
                // return should be true on success
                $returnMsg = insertDownvote($route, $type, $sendData);
                if(!empty($returnMsg)) {
                    header('Content-type: application/json');
                    echo $returnMsg;
                }
            }
            break;
        
        case 'uploadUserImage':
            // sanity check - empty input
            if (isset($_FILES['file']) == false) {
                die('error: no file or filename specified (execAction() - uploadUserImage)');
            } else {
                // return should be true on success
                $returnMsg = uploadFile($type, $_FILES['file'], $route);
                if(!empty($returnMsg)) {
                    header('Content-type: text/plain');
                    echo $returnMsg;
                }
            }
            break;
        
        case 'deleteUserImage':
            header('Content-type: application/json');
            echo deleteUserImage($route, $type);
            break;
        
        case 'getCurrentlyPlaying':
            header('Content-type: application/json');
            echo getCurrentlyPlaying($route, $type);
            break;
        
        case 'getUserPlaylist':
            header('Content-type: application/json');
            echo getUserPlaylist($route, $type);
            break;
        
        case 'getUserImage':
            header('Content-type: application/json');
            echo getUserImage($route, $type);
            break;

        case 'checkForNewUpdates':
            $data = getCurrentMusicplayerInfo($route, $type);
            if(empty($data) === false){
                header('Content-type: application/json');
                echo $data;
            }
            break;

        case 'getInternetAccess':
            header('Content-type: application/json');
            echo getInternetAccess($route, $type);
            break;

        case 'setInternetAccess':
            header('Content-type: application/json');
            echo setInternetAccess($route, $type);
            break;

        case 'getDownvoteLevel':
            header('Content-type: application/json');
            echo getDownvoteLevel($route, $type);
            break;
            
        case 'setDownvoteLevel':
            header('Content-type: application/json');
            echo setDownvoteLevel($route, $type, $sendData);
            break;
    }
}


execAction();

