<?php

require_once('util.php');

$createFile = createTxtFile(85);
if($createFile){
	echo 'passt';
}

/* createTxtFile()
 * needed for is client view up to date
 * @param String $content
 * @return true on success, false on fail
 */
function createTxtFile($content){
	global $currentlyPlayingFilePath;
    // fail = returns false if something doesn‘t work
    // success = returns the quantity of written bytes
    $msg = file_put_contents($currentlyPlayingFilePath, $content);
    if($msg !== false){
        return true;
    } else {
        return false;
    }
}