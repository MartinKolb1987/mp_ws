<?php

/* Musicplayer Client Web Service
 * @package musicplayer
 * @author master group mobile experience
 * @version Alpha 1
 */

// includes
require_once('../util.php');

class ClientDB extends SQLite3
{
    function __construct()
    {
    	global $db_path;
    	// $this->open('/usr/share/nginx/html/server/tmp/db.sqlite');
        $this->open($db_path);
        $this->busyTimeout(20000);
    }
}
?>
