<?php

/* MusicHive User Administration
 * @package musichive
 * @author musichive
 * @version Alpha 1
 */

// includes
require_once('db/db.php');
require_once('users.php');


/* addTrack()
 * @param String $filename filename and path of the track, String $t_artiest artist from metadata, String $t_title title from metadata, String $t_album album from metadata, Integer $t_length length in seconds from metadata
 */
function addTrack($filename, $t_artist, $t_title, $t_album, $t_length) {
    global $clientIp;
    global $truePath;
    $bucketToFill;
	$leftover = 0;

    // is there a file?
    if (strlen($filename) == 0) {
        die('error: no file');
    }
	
	// initialize database
    $db = new ClientDB();
	
    // get all tracks from specific user
    $userTracksCount = 0;
    $userTracksCountQuery = $db->query("SELECT t.t_id FROM bucketcontents b INNER JOIN tracks t ON b.t_id = t.t_id WHERE t.u_ip = '$clientIp' AND (b.b_played = 0 OR b.b_currently_playing = 1)");
    while ($row = $userTracksCountQuery->fetchArray(SQLITE3_ASSOC)) {
        $userTracksCount++;
    }
	
    if ($userTracksCount >= 5) {
        die('error: too many tracks');
    }
	
	// check if leftover
    $leftoverTracksCount = 0;
	$leftoverTrackCountQuery = $db->query("SELECT t.t_id FROM bucketcontents bc INNER JOIN tracks t ON bc.t_id = t.t_id INNER JOIN buckets b ON bc.b_id = b.b_id WHERE t.u_ip = '$clientIp' AND bc.b_played = 1 AND bc.b_currently_playing = 0 AND b.b_is_active = 1");
	while ($row = $leftoverTrackCountQuery->fetchArray(SQLITE3_ASSOC)) {
        $leftoverTracksCount++;
    }
	
	if ($leftoverTracksCount > 0) {
        $leftover = 1;
    }
	
	// close db
    $db->close();
    unset($db);

    // get active bucket from bucket table
    $activeBucketId = getActiveBucket();

	// check if a bucket to fill exists
	if ($activeBucketId == 0) {
		// initialize database
		$db = new ClientDB();
		
		// create new active bucket
		$db->exec("INSERT INTO buckets (b_is_active) VALUES (1)");
		
		// close db
		$db->close();
		unset($db);
		
		$activeBucketId = getActiveBucket();
	}
		
    // the bucket (b_id) the user wants to add the track to
    $bucketToFill = $activeBucketId + $userTracksCount + $leftover;
	
	echo('error: DEBUG, bucket to fill: '.$bucketToFill.' tracksCount: '.$userTracksCount.' leftover: ' . $leftover . 'activeBucket: '.$activeBucketId . 'filename: '.$filename);
	
	// initialize database
	$db = new ClientDB();
	
	// check if bucket to fill exists
	$bucketToFillCount = 0;
    $bucketToFillQuery = $db->query("SELECT b_id FROM buckets WHERE b_id = $bucketToFill");
	echo('error: DEBUG bucketToFillQuery: ');
	print_r($bucketToFillQuery);
    while ($row = $bucketToFillQuery->fetchArray(SQLITE3_ASSOC)) {
        $bucketToFillCount++;
    }
	
	if ($bucketToFillCount == 0) {
		// create new active bucket
		$db->exec("INSERT INTO buckets (b_is_active) VALUES (0)");
	}

    // insert track into db
	echo('inserting: '.$clientIp . ' ' .$filename . ' ' .$t_artist . ' ' .$t_title . ' ' .$t_album . ' ' .$t_length);
    $dbInsert = $db->exec("INSERT INTO tracks (u_ip, t_filename, t_artist, t_title, t_album, t_length) VALUES ('$clientIp', '$filename', '$t_artist', '$t_title', '$t_album', $t_length)");
	echo('insert: '.$dbInsert);

    // fill bucketcontents with t_id
    // ========================================
    // !!!! @TODO: do this with DB trigger on insert !!!!
    $trackIdQuery = $db->query("SELECT t_id FROM tracks WHERE t_filename='$filename'");
    $trackId;
    
    while ($row = $trackIdQuery->fetchArray(SQLITE3_ASSOC)) {
        $trackId = $row['t_id'];
    }
    
	echo('t-id: '.$trackId);
	
	if(empty($trackId)) {
		die('error: t_id not found - insert into tracks failed? (addTrack())');
	}
	
    $db->exec("INSERT INTO bucketcontents (t_id, b_id, b_played, b_currently_playing) VALUES ('$trackId', '$bucketToFill', 0, 0)");
    // ========================================
    
    // close db
    $db->close();
    unset($db);
}


/* swapTrack()
 * Swaps given tracks (bucketcontents b_id) with each other
 * @param Integer $track1 t_id from first track to swap, Integer $track2 t_id from second track to swap
 * @return Boolean true on success
 */
function swapTrack($track1, $track2) {
    global $clientIp;
	(int)$track1 = $track1;
	(int)$track2 = $track2;

    if (userOwnsTrack($track1) == false || userOwnsTrack($track2) == false) {
        die('error: user does not own one of the tracks (swapTrack() - wrong track id?)');
    }

    // is track currently playing?    
    $currentlyPlaying = currentlyPlaying();
    
    if ($currentlyPlaying == $track1 || $currentlyPlaying == $track2) {
        die('error: one track is currently playing, cannot swap (swapTrack())');
    }
    
    // get both track bucket ids 
    $bucket1;
    $bucket2;
	
	// initialize database
    $db = new ClientDB();
    
    $bucket1Query = $db->query("SELECT b_id FROM bucketcontents WHERE t_id='$track1'");

    while ($row = $bucket1Query->fetchArray(SQLITE3_ASSOC)) {
        $bucket1 = (int)$row['b_id'];
    }

    $bucket2Query = $db->query("SELECT b_id FROM bucketcontents WHERE t_id='$track2'");
    
    while ($row = $bucket2Query->fetchArray(SQLITE3_ASSOC)) {
        $bucket2 = (int)$row['b_id'];
    }
    
    // swap bucket ids in db
    $db->exec("UPDATE bucketcontents SET b_id=$bucket1 WHERE t_id=$track2");
    $db->exec("UPDATE bucketcontents SET b_id=$bucket2 WHERE t_id=$track1");

    // close db
    $db->close();
    unset($db);
	
	return true;
}


/* deleteTrack()
 * Delete a track from db and reorder bucketcontents
 * @param Integer $track t_id to delete
 * @return Boolean true on success
 */
function deleteTrack($track) {
    global $clientIp;
	
	// does user own the track?
    if (userOwnsTrack($track) == false) {
        die('error: user does not own the track');
    }
    
    // is the track currently playing?
    $currentlyPlaying = currentlyPlaying();

	// initialize database
    $db = new ClientDB();
	
    if ($currentlyPlaying == $track) {
        $db->exec("INSERT INTO downvotes (u_ip, t_id) VALUES ('127.0.0.1', $track)");
    } else {
	    // delete track from db
		$db->exec("DELETE FROM bucketcontents WHERE t_id = $track");
		$db->exec("DELETE FROM downvotes WHERE t_id = $track");
		$db->exec("DELETE FROM tracks WHERE t_id = $track");
	}
	
	// close db
    $db->close();
    unset($db);
    
    // re-sort all other tracks of current user according to bucket order

    // get current active bucket
    $activeBucketId = getActiveBucket();
	
	// initialize database
    $db = new ClientDB();
    
    // get current user playlist (all tracks of the user with buckets)
    $userPlaylistQuery = $db->query("SELECT b.t_id, b.b_id FROM bucketcontents b INNER JOIN tracks t ON b.t_id = t.t_id WHERE t.u_ip = '$clientIp' ORDER BY b.b_id ASC");
	$userPlaylistArray = [];
	while ($row = $userPlaylistQuery->fetchArray(SQLITE3_ASSOC)) {
        array_push($userPlaylistArray, $row);
    }
	$userTrackCount = (int)count($userPlaylistArray);
	
	/*echo 'user has tracks: ' . $userTrackCount . '<br/>';
	echo 'array looks like this: ';
	print_r($userPlaylistArray);
	echo '<br/>';*/
    
    // sorting algo
    for ($i = 0; $i < ($userTrackCount - 1); $i++) {
		//echo 'currently sorting entry no: ' . $i . '<br/>';
        // special check case for the first entry
        if ($i == 0) {
			//echo 'checking first entry... <br/>';
            // only change bucket for this track if it is not inside the active bucket
            if ((int)$userPlaylistArray[$i]['b_id'] != $activeBucketId) {
				//echo 'first entry is not in active bucket! <br/>';
                $currentTitleId = (int)$userPlaylistArray[$i]['t_id'];
                $db->exec("UPDATE bucketcontents SET b_id=$activeBucketId WHERE t_id=$currentTitleId");
                $userPlaylistArray[$i]['b_id'] = $activeBucketId;
				//echo 'first entry corrected! <br/>';
            }
        }
        // compare current track ($i) with next track in playlist ($i+1)
        // if the difference of both b_id's is bigger then one, there is a gap and sorting begins
        if ((int)$userPlaylistArray[$i]['b_id'] != ((int)$userPlaylistArray[$i+1]['b_id'] - 1)) {
			//echo 'bucket gap found between ' . (int)$userPlaylistArray[$i]['t_id'] . ' and ' . (int)$userPlaylistArray[$i+1]['t_id'] . '<br/>';
            $newBucketId = (int)$userPlaylistArray[$i]['b_id'] + 1;
            $newTitleId = (int)$userPlaylistArray[$i+1]['t_id'];
            $db->exec("UPDATE bucketcontents SET b_id=$newBucketId WHERE t_id=$newTitleId");
            $userPlaylistArray[$i+1]['b_id'] = $newBucketId;
        }
    }
    
    // close db
    $db->close();
    unset($db);
	
	return true;
}

/* insertDownvote()
 * Inserts a downvote for a given track
 * @param Integer $track track t_id for the track to downvote
 * @return Boolean true on success
 */
function insertDownvote($track) {  
    global $clientIp;
    $track = (int)$track;
    
    // checks if given track id is currently being played    
    $currentlyPlaying = currentlyPlaying();    
    if ($currentlyPlaying != $track) {
        die('error: the given track is not currently playing!');
    }
	
	// initialize database   
    $db = new ClientDB();
    
    // checks if user has already voted
    $userDownvoteQuery = $db->query("SELECT COUNT(u_ip) FROM downvotes WHERE u_ip = '$clientIp' AND t_id = $track");
    $userDownvoteArray = $userDownvoteQuery->fetchArray(SQLITE3_ASSOC);
    $userDownvoteCount = $userDownvoteArray['COUNT(u_ip)'];
    
    if ($userDownvoteCount > 0) {
        die('error: user has already voted for the current track!');
    }
     
    $db->exec("INSERT INTO downvotes (u_ip, t_id) VALUES ('$clientIp', $track)");
	
    // close db
    $db->close();
    unset($db);
	
	return true;
}

/* currentlyPlaying()
 * @return Integer t_id of the track that is currently playing
 */
function currentlyPlaying() {
    // initialize database
    $db = new ClientDB();

    $currentTrackQuery = $db->query("SELECT t_id FROM bucketcontents WHERE b_currently_playing=1");
    $currentTrack = 0;

    while ($row = $currentTrackQuery->fetchArray(SQLITE3_ASSOC)) {
		$currentTrack = (int)$row['t_id'];
    }
	
	// close db
    $db->close();
    unset($db);

    return $currentTrack;
}


/* userOwnsTrack()
 * Check if current user owns a track
 * @param Integer $track t_id to check
 * @return Boolean true if the user owns the track
 */
function userOwnsTrack($track) {
    // initialize database
    $db = new ClientDB();
	
    global $clientIp;
    
    $trackQuery = $db->query("SELECT u_ip FROM tracks WHERE t_id=$track");
    
    while ($row = $trackQuery->fetchArray(SQLITE3_ASSOC)) {
        if ($row['u_ip'] == $clientIp) {
            return true;
        } else {
            return false;
        }
    }
	
	// close db
    $db->close();
    unset($db);
}

/* getActiveBucket()
 * Get the id (b_id) of the currently active bucket
 * @return Integer b_id of the currently active bucket
 */
function getActiveBucket() {
	// initialize database
    $db = new ClientDB();
	
	$activeBucketQuery = $db->query("SELECT b_id FROM buckets WHERE b_is_active=1");
	$activeBucketId = 0;

    while ($row = $activeBucketQuery->fetchArray(SQLITE3_ASSOC)) {
        $activeBucketId = (int)$row['b_id'];
		if(empty($activeBucketId)) {
			$activeBucketId = 0;
		}
    }
	
	// close db
    $db->close();
    unset($db);
	
	return $activeBucketId;
}

?>
