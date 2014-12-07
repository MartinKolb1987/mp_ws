<?php

/* Musicplayer Client Web Service
 * @package musicplayer
 * @author master group mobile experience
 * @version Alpha 1
 */

// includes
require_once('../db/db.php');
require_once('tracks.php');
require_once('../util.php');

// global variables
// $uploadDirectory = getenv("DOCUMENT_ROOT") . '/server/userdata/';
global $uploadDirectory;
// $truePath = '/usr/share/nginx/html/server/userdata/';
global $truePath;

/* getClientIp()
 * @return String u_ip - remote address of user calling the script
 */
function getClientIP() {
    if (isset($_SERVER)) {
        if (isset($_SERVER["HTTP_X_FORWARDED_FOR"]))
            return $_SERVER["HTTP_X_FORWARDED_FOR"];
        if (isset($_SERVER["HTTP_CLIENT_IP"]))
            return $_SERVER["HTTP_CLIENT_IP"];
        return $_SERVER["REMOTE_ADDR"];
    }
}

/* getClientMAC()
 * @return String u_mac
 */
function getClientMAC() {

    $ipAddress=$_SERVER['REMOTE_ADDR'];
    $macAddr=false;

    #run the external command, break output into lines
    $arp=`arp -a 192.168.211.2`;

    print_r($arp);


    $lines=explode("\n", $arp);

    #look for the output line describing our IP address
    foreach($lines as $line)
    {
       $cols=preg_split('/\s+/', trim($line));

       if (empty($cols[0]) === false) {
        print('<pre>');
       print_r($cols);

       if ($cols[1]=='(192.168.211.2)')
       {
           $macAddr=$cols[3];
       }
       }
       
    }
    echo 'mac address: ' . $macAddr . '<br/>';

}


/* checkUser()
 * Check database for user, create user if necessary
 * @return String u_ip - remote address of user calling the script
 */
function checkUser($websocketClientIp = '') {
    // initialize database   
    $db = new ClientDB();
    $currentIP = getClientIP();

    // take client ip from websocket
    if(empty($websocketClientIp) === false){
        $currentIP = $websocketClientIp;
    }

    // get user entries with current user ip
    $currentUserCount = 0;
    $currentUserQuery = $db->query("SELECT u_ip FROM users WHERE u_ip='$currentIP'");
    while ($row = $currentUserQuery->fetchArray(SQLITE3_ASSOC)) {
        $currentUserCount++;
    }
    
    // close db
    $db->close();
    unset($db);

    //echo 'this user ip is ' . $currentUserCount . ' times in the db<br/>';
    
    // create user directories, if needed
    createUserDirectories($currentIP);

    // if count = 0, create new user
    if ($currentUserCount == 0) {
        //echo('creating new user:</br>' . $currentIP . '</br>');
        return(createUser($currentIP));
    } else {
        //echo('User already in db!</br>' . $currentIP . '</br>');
        return $currentIP;
    }
}


/* createUser()
 * Add user to database and create user directory
 * @param String $currentIP current user ip
 * @return String u_ip - remote address of user calling the script
 */
function createUser($currentIP) { 
    global $truePath;
    
    // first user will become admin, so check if first user
    $userCount = getActiveUsers();
    
    //echo 'there are ' . $userCount . ' users in the db<br/>';
    
    
    // initialize database   
    $db = new ClientDB();

    // get the mac address
    $macAddress = 'sdf';
    // $macAddress = getClientMAC($currentIP);
    
    // insert data
    $db->exec("INSERT INTO users (u_ip, u_mac, u_picture, u_dj, u_current_track) VALUES ('$currentIP', ' $macAddress', 'default.png', 0, 0)");

    if ($userCount === -1) {
        $db->exec("INSERT INTO admins (u_ip, a_downvote_level, a_internet_access) VALUES ('$currentIP', 50, 0)");
    }

    // close db
    $db->close();
    unset($db);
    
    return($currentIP);
}


/* createUserDirectories()
 * create images and tracks directory
 * @param String $currentIP
 */
function createUserDirectories($currentIP){
    global $uploadDirectory;

    // create user directory
    $pathImages = $uploadDirectory . $currentIP . '/images/';
    $pathTracks = $uploadDirectory . $currentIP . '/tracks/';

    if(file_exists($pathImages) === false) {
        mkdir($pathImages, 0777, true);
        chmod($pathImages, 0777); // otherwise it doesn‘t work
        mkdir($pathTracks, 0777, true);
        chmod($pathTracks, 0777); // otherwise it doesn‘t work
    }
}


/* getActiveUsers()
 * Returns all active users
 * @return Integer count of all active users
 */
function getActiveUsers() {
    $usersCount = 0;
    
    // initialize database   
    $db = new ClientDB();
    
    $usersQuery = $db->query("SELECT u_ip FROM users");
    while ($row = $usersQuery->fetchArray(SQLITE3_ASSOC)) {
        $usersCount++;
    }
    
    // close db
    $db->close();
    unset($db);
    
    // substract super user
    // --> production raspberry as user
    $usersCount = $usersCount - 1;

    return $usersCount;
}


/* setPicture()
 * Add user picture to database
 * @param String path to picture
 * @return Boolean true on success
 */
function setPicture($path) {
    global $clientIp;
    
    // take care about disk space
    deleteOldUserImageFromDisk($clientIp);

    // initialize database   
    $db = new ClientDB();
    
    $db->exec("UPDATE users SET u_picture = '$path' WHERE u_ip='$clientIp'");
    
    // close db
    $db->close();
    unset($db);
    
    return $path;
}


/* deleteUserImage()
 * Remove user picture from database
 * @return Boolean true on success
 */
function deleteUserImage($route, $type, $websocketClientIp = '') {
    global $clientIp;
    global $uploadDirectory;
    
    // take client ip from websocket
    if(empty($websocketClientIp) === false){
        $clientIp = $websocketClientIp;
    }
    
    // take care about disk space
    deleteOldUserImageFromDisk($clientIp);

    // initialize database   
    $db = new ClientDB();

    $db->exec("UPDATE users SET u_picture = 'default.png' WHERE u_ip='$clientIp'");
    $defaultImagePath = '../server/userdata/default.png';
    
    // close db
    $db->close();
    unset($db);

    return '{"route":"' .  $route . '","type":"' . $type . '","userImage": { "url": "' . $defaultImagePath. '"}}';
}


/* deleteOldUserImageFromDisk()
 * Remove user picture from disk
 */
function deleteOldUserImageFromDisk($clientIp){
    global $uploadDirectory;

    // initialize database   
    $db = new ClientDB();

    $imagePath = $db->query("SELECT u_picture FROM users WHERE u_ip = '$clientIp'");
    $imagePath = $imagePath->fetchArray(SQLITE3_ASSOC);
    $oldImagePath = $uploadDirectory . $imagePath['u_picture'];

    // remove old image
    if($imagePath['u_picture'] !== 'default.png'){
        shell_exec("rm -f $oldImagePath");
    }

    // close db
    $db->close();
    unset($db);
}

?>
