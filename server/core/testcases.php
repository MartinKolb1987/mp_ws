<?php

/* Musicplayer Client Web Service
 * @package Musicplayer
 * @author master group mobile experience
 * @version Alpha 1
 */

// includes
// require_once('db/db.php');
//require_once('db/createdb.php');
// require_once('util.php');
require_once('users.php');
// require_once('tracks.php');
require_once('admin.php');
//require_once('player.php');

// get clientIp 
// $clientIp = checkUser();

/*
// add 5 tracks 
for ($i = 0; $i < 5; $i++) {
	$filename = $clientIp.'/tracks/track' . ($i + 1) . '.mp3';
	echo ('adding track ' . $filename . '<br/>');
	addTrack($filename, ($i + 1));
}


/* swap 'track2.mp3' with 'track3.mp3' 
//echo userOwnsTrack(6);
swapTrack(9, 10);

/* delete 'track4.mp3' 
deleteTrack(12);

/*$testFilename = getTrackToPlay();
playbackFinished($testFilename);
getTrackToPlay();

$downvotes = abortPlayback();
echo ('downvotes: '.$downvotes.'<br/>');*/

//change internet access
// setInternetAccess(1);
// echo ('set internet access <br/>');

// addTrack('192.168.0.64/6686089.mp3');

echo getClientIP() . '<br/><br/>';
var_dump($_SERVER);
echo '<br/><br/>';

$db = new ClientDB();
echo 'db errors: ' . $db->lastErrorMsg() . '<br/>';
$db->close();
unset($db);

?>
