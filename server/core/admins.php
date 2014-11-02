<?php

/* Musicplayer Client Web Service
 * @package musicplayer
 * @author master group mobile experience
 * @version Alpha 1
 */

// includes
require_once('../db/db.php');
require_once('users.php');

/* checkAdmin()
 * Update the different downvote levels - coming from the frontend
 */
function checkAdmin($clientIp) {

    // initialize database   
    $db = new ClientDB();

    $adminCount = 0;
    $adminQuery = $db->query("SELECT * FROM admins WHERE u_ip='$clientIp'");
    while ($row = $adminQuery->fetchArray(SQLITE3_ASSOC)) {
        $adminCount++;
    }

    // close db
    $db->close();
    unset($db);

    if ($adminCount == 1) {
        return true;
    } else {
        return false;
    } 
}



/* updateDownvoteLevel()
 * Update the different downvote levels - coming from the frontend
 */
function updateDownvoteLevel($downvoteLevel) {
    $currentIP = getClientIP();

    // initialize database   
    $db = new ClientDB();

    $admin = checkAdmin();

    if ($admin) {
        $db->exec("UPDATE admins SET a_internet_access = '$downvoteLevel' WHERE u_ip='$currentIP'");

        // close db
        $db->close();
        unset($db);

    } else {
        // close db
        $db->close();
        unset($db);

        die('error: user is not an admin and can not change the downvote level');
    }

}

/* setInternetAccess()
 * Render JSON with the internet access - coming from the frontend
 */
function setInternetAccess($route, $type, $websocketClientIp = '') {
    global $clientIp;
    
    // take client ip from websocket
    if(empty($websocketClientIp) === false){
        $clientIp = $websocketClientIp;
    }

    // initialize database   
    $db = new ClientDB();

    $admin = checkAdmin($clientIp);

    if ($admin) {

        $internetAccessQuery = $db->query("SELECT a_internet_access FROM admins WHERE u_ip = '$clientIp'");
        $internetAccessArray = $internetAccessQuery->fetchArray(SQLITE3_ASSOC);
        $internetAccess = $internetAccessArray['a_internet_access'];

        if ($internetAccess == 0) {
            $db->exec("UPDATE admins SET a_internet_access = 1 WHERE u_ip='$clientIp'");
        } else {
            $db->exec("UPDATE admins SET a_internet_access = 0 WHERE u_ip='$clientIp'");
        }

        // close db
        $db->close();
        unset($db);

    } else {
        // close db
        $db->close();
        unset($db);

        die('error: user is not an admin and can not change the internet access');
    }

    return '{"route":"' .  $route . '", "type": "' . $type . '" ,"internetAccess":' . $internetAccess . '}';
}

/* getBlacklist()
 * Get the blacklist from the database - coming from the frontend
 */
function getBlacklist() {
    $currentIP = getClientIP();
    $blacklistArray = [];
    
    // initialize database   
    $db = new ClientDB();

    $admin = checkAdmin();

    if ($admin) {
        $db->exec("UPDATE admins SET a_internet_access = '$internetAccess' WHERE u_ip='$currentIP'");

        // close db
        $db->close();
        unset($db);

    } else {
        // close db
        $db->close();
        unset($db);

        die('error: user is not an admin and can not get the blacklist');
    }
    
    //get blacklist
    
    
    // $userPlaylistQuery = $db->query("SELECT b.t_id, b.b_id, t.t_artist, t.t_title, t.t_filename, t.t_album, t.t_length FROM bucketcontents b INNER JOIN tracks t ON b.t_id = t.t_id WHERE t.u_ip = '$clientIp' AND b.b_played = 0 ORDER BY b.b_id ASC");
    // $userPlaylistArray = [];
    // $listEntryCounter = 0;
    
    // while ($row = $userPlaylistQuery->fetchArray(SQLITE3_ASSOC)) {
    //     $listEntryCounter++;
    //     $userPlaylistArray[(String)$listEntryCounter] = $row;
    // }
    
    
    $blacklistArray['blacklist'] = $userPlaylistArray;
    
    return json_encode($blacklistArray);
}

/* banUser()
 * Set user whose track is currently playing on the blacklist - coming from the frontend
 */
function banUser() {

}

/* deleteBannedUser()
 * Delete user from the blacklist - coming from the frontend
 */
function deleteBannedUser() {

}

/* resetPlaylist()
 * Reset the bucketcontent, downvotes, blacklist, buckets and tracks
 */
function resetPlaylist() {

}


?>