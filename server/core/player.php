<?php

/* Musicplayer Client Web Service
 * @package musicplayer
 * @author master group mobile experience
 * @version Alpha 1
 */

// includes
require_once('../db/db.php');
require_once('users.php');
require_once('tracks.php');
require_once('../util.php');

/* execAction()
 * Determine what to do, depending on client $_POST['type']
 * Rendered output will be text
 */
function execAction() {
    $action = $_GET['type'];
    // get action
    if(empty($action)) {
        // debug mode
        header('Content-type: application/json');
        return '{"route":"' .  $route . '", "type": "error", "message": "no action specified (GET type)"}';
    }
    
    switch($action){
        case 'getTrack':
            // return should be true on success
            $returnMsg = getTrackToPlay();
            if($returnMsg) {
                header('Content-type: text/plain');
                echo $returnMsg;
            }
            break;
        
        case 'playbackFinished':
            // sanity check - empty input
            $returnMsg = playbackFinished();
			header('Content-type: text/plain');
			if($returnMsg) {
				echo '1';
			} else {
				echo '0';
			}
            break;
        
        case 'abortPlayback':
            $returnMsg = abortPlayback();
            header('Content-type: text/plain');
            echo $returnMsg;
            break;
    }
}

/* getTrackToPlay()
 * Music player will ask for the new track to be played after the current track has finished
 * @return String filename and path of title to play, 'empty' if nothing to play
 */
function getTrackToPlay() {

    global $truePath;
    global $tempPath;

	// get active bucket from bucket table
    $activeBucketId = getActiveBucket();

    // initialize database
    $db = new ClientDB();

	// check if a track is currently playing
    $currentlyPlayingTrackCount = 0;
	$currentlyPlayingTrackQuery = $db->query("SELECT t_id FROM bucketcontents WHERE b_id = $activeBucketId AND b_currently_playing = 1");
    while ($row = $currentlyPlayingTrackQuery->fetchArray(SQLITE3_ASSOC)) {
        $currentlyPlayingTrackCount++;
    }
	if ($currentlyPlayingTrackCount == 1) {
		// replay currently playing track
		$currentlyPlayingFilename;
		$currentlyPlayingQuery = $db->query("SELECT t.t_filename FROM bucketcontents b INNER JOIN tracks t ON b.t_id = t.t_id WHERE b.b_currently_playing = 1");
		$currentlyPlayingCountRow = $currentlyPlayingQuery->fetchArray(SQLITE3_ASSOC);
		$currentlyPlayingFilename = $currentlyPlayingCountRow['t_filename'];
		

        // return the t_filename of random track
        $fileExt = '';
        $fileExt = explode('.', $currentlyPlayingFilename);
        $fileExt = '.' . $fileExt[sizeof($fileExt) - 1];
        
        shell_exec('cp -fr ' . $truePath . $currentlyPlayingFilename . ' ' . $tempPath . 'currently_playing' . $fileExt );
        
        return 'currently_playing' . $fileExt;

		//echo ('playing same track again. <br/>');
		
		// return $currentlyPlayingFilename;
		
	}

    // get all unplayed tracks within the active bucket)
    $bucketTracksCount = 0;
    $bucketTracksQuery = $db->query("SELECT t_id FROM bucketcontents WHERE b_id = $activeBucketId AND b_played = 0");
    while ($row = $bucketTracksQuery->fetchArray(SQLITE3_ASSOC)) {
        $bucketTracksCount++;
    }

    // switch to next bucket if every track in active bucket is played and next bucket exists
    if ($bucketTracksCount == 0) {
        //echo('error: there are no more unplayed tracks within the active bucket! Switching to next bucket.<br/>');

        // look if next bucket exists
        $nextActiveBucketId = $activeBucketId + 1;
        $nextBucketCount = 0;
        $nextBucket = $db->query("SELECT b_id FROM buckets WHERE b_id = $nextActiveBucketId");
        while ($row = $nextBucket->fetchArray(SQLITE3_ASSOC)) {
            $nextBucketCount++;
        }
        if ($nextBucketCount == 0) {
            //echo('error: there are no more buckets to play from.<br/>');

            // close db
            $db->close();
            unset($db);

            return 'empty';
        }

        // switch buckets 
        $db->exec("UPDATE buckets SET b_is_active=0 WHERE b_id=$activeBucketId");
        $db->exec("UPDATE buckets SET b_is_active=1 WHERE b_id=$nextActiveBucketId");
        $activeBucketId = $nextActiveBucketId;

        // look if next bucket is empty
        $bucketTracksCount = 0;
        $bucketTracksQuery = $db->query("SELECT t_id FROM bucketcontents WHERE b_id = $activeBucketId AND b_played = 0");
        while ($row = $nextBucket->fetchArray(SQLITE3_ASSOC)) {
            $bucketTracksCount++;
        }
        if ($bucketTracksCount == 0) {
            // echo('error: the next bucket is empty.<br/>');

            // close db
            $db->close();
            unset($db);

            return 'empty';
        }

    }

    // get all unplayed tracks within the active bucket
    $unplayedTracksQuery = $db->query("SELECT t_id FROM bucketcontents WHERE b_id = $activeBucketId AND b_played = 0");

    // push the t_ids of the unplayed tracks into an array
    $unplayedBucketTracks = [];
	while ($row = $unplayedTracksQuery->fetchArray(SQLITE3_ASSOC)) {
        array_push($unplayedBucketTracks, (int)$row['t_id']);
    }
    /*echo ('BucketPlaylist:');
    print_r($unplayedBucketTracks);
    echo ('<br/>');*/

    // count the tracks within the array
    $bucketTracksCount = ((int)count($unplayedBucketTracks) - 1);

    // check if there is only one element
	if($bucketTracksCount == 0) {
		// no random because only one element exists
		$randomTrackNumber = 0;
	} else {
		// get a random track within all unplayed tracks
		$randomTrackNumber = rand(0, $bucketTracksCount);
	}
	
	// get the id of the random track
	$randomTrackId = $unplayedBucketTracks[$randomTrackNumber];

    // get the u_ip and t_filename from the random track
    $randomTrackFilename;
    $randomTrackUserIp;
    $randomTrackQuery = $db->query("SELECT t_filename, u_ip FROM tracks WHERE t_id = $randomTrackId");

    while ($row = $randomTrackQuery->fetchArray(SQLITE3_ASSOC)) {
        $randomTrackFilename = $row['t_filename'];
        $randomTrackUserIp = $row['u_ip'];
    }

    //echo ('next song to be played: --- t_id: '.$randomTrackId.' - t_filename: '.$randomTrackFilename.'<br/>');

    // set the status of the random track to currently_playing
    $db->exec("UPDATE bucketcontents SET b_currently_playing = 1 WHERE t_id=$randomTrackId");

    // update current dj data
    // $db->exec("UPDATE users SET u_dj = 1, u_current_track = $randomTrackId WHERE u_ip = '" . $randomTrackUserIp . "'");

    // close db
    $db->close();
    unset($db);
    
    // return the t_filename of random track
    $fileExt = '';
    $fileExt = explode('.', $randomTrackFilename);
    $fileExt = '.' . $fileExt[sizeof($fileExt) - 1];
    
    shell_exec('cp -fr ' . $truePath . $randomTrackFilename . ' ' . $tempPath . 'currently_playing' . $fileExt );
    
    return 'currently_playing' . $fileExt;
}

/* playbackFinished()
 * Music player will call this after playback has finished
 * @param String $finishedTrack filename and path of finished title
 * @return 1 on success, 0 on fail
 */
function playbackFinished() {

    // initialize database
    $db = new ClientDB();

    // get the t_id from the finished track with the t_filename
    $finishedTrackId;
    $finishedTrackQuery = $db->query("SELECT t_id FROM bucketcontents WHERE b_currently_playing = 1");
    while ($row = $finishedTrackQuery->fetchArray(SQLITE3_ASSOC)) {
        $finishedTrackId = $row['t_id'];
    }


    // $db->exec("UPDATE users SET u_dj = 0, u_current_track = 0 WHERE u_dj = 1");

    //echo ('finished track id: '.$finishedTrackId.'<br/>');

	//update track-status
    $db->exec("UPDATE bucketcontents SET b_currently_playing = 0, b_played = 1 WHERE t_id = '$finishedTrackId'");

	return true;

    // close db
    $db->close();
    unset($db);
}


/* abortPlayback()
 * Music player will ask every 10s if the track should be aborted
 * @return Integer 0 = play, 1 = abort
 */
function abortPlayback() {
	// get currently played track
    $currentTrackId = currentlyPlaying();

    // get user count
    $usersCount = getActiveUsers();
	
	// initialize database
    $db = new ClientDB();
    
    // get the current downvote-count from the played track
    $downvoteCount = 0;
    $downvoteQuery = $db->query("SELECT u_ip FROM downvotes WHERE t_id = '$currentTrackId'");
    while ($row = $downvoteQuery->fetchArray(SQLITE3_ASSOC)) {
        $downvoteCount++;
    }
	
	// check if user aborted track (super admin downvote)
    $deletedCount = 0;
	$deletedQuery = $db->query("SELECT u_ip FROM downvotes WHERE u_ip = '127.0.0.1' AND t_id = '$currentTrackId'");
    while ($row = $deletedQuery->fetchArray(SQLITE3_ASSOC)) {
        $deletedCount++;
    }

    // close db
    $db->close();
    unset($db);

    // decide if downvotes are over 50% to abort the playback
    if ($downvoteCount > ($usersCount / 2)) {
        return 1;
    } else {
		if($deletedCount == 1) {
			return 1;
		} else {
			return 0;
		}
    }
    
}

execAction();

?>
