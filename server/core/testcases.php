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


echo getClientIP() . '<br/><br/>';
var_dump($_SERVER);
echo '<br/><br/>';

$db = new ClientDB();
echo 'db errors: ' . $db->lastErrorMsg() . '<br/>';
$db->close();
unset($db);

?>
