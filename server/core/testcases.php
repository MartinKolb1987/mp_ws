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
require_once('client_actions.php');



getUserPlaylist('home', "getUserPlaylist", '127.0.0.1');

$db = new ClientDB();
echo 'db errors: ' . $db->lastErrorMsg() . '<br/>';
$db->close();
unset($db);

?>
