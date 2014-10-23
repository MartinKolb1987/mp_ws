<?php

/* MusicHive Database Creation
 * @package musichive
 * @author musichive
 * @version Alpha 1
 */

// includes
require_once('db.php');

// initialize database
$db = new ClientDB();
// enable foreign keys for db
$db->exec("PRAGMA foreign_keys = ON;");

// drop old tables
echo('initializing database, dropping old tables...<br/>');
$db->exec("DROP TABLE downvotes");
$db->exec("DROP TABLE bucketcontents");
$db->exec("DROP TABLE blacklist");
$db->exec("DROP TABLE buckets");
$db->exec("DROP TABLE tracks");
$db->exec("DROP TABLE users");

// create new tables
echo('creating new tables...<br/>');
// users
$db->exec("CREATE TABLE users (u_ip TEXT PRIMARY KEY, u_picture TEXT, u_admin INT)");
// tracks
$db->exec("CREATE TABLE tracks (t_id INTEGER PRIMARY KEY AUTOINCREMENT, u_ip TEXT REFERENCES users(u_ip), t_filename TEXT, t_artist TEXT, t_title TEXT, t_album TEXT, t_length INT)");
// blacklist
$db->exec("CREATE TABLE blacklist (u_ip TEXT REFERENCES users(u_ip), t_id INTEGER REFERENCES tracks(t_id), bl_timestamp TEXT, bl_mac TEXT)");
// buckets
$db->exec("CREATE TABLE buckets (b_id INTEGER PRIMARY KEY AUTOINCREMENT, b_is_active INT)");
// downvotes
$db->exec("CREATE TABLE downvotes (u_ip TEXT REFERENCES users(u_ip), t_id INTEGER REFERENCES tracks(t_id))");
// bucketcontents
$db->exec("CREATE TABLE bucketcontents (t_id INTEGER REFERENCES tracks(t_id), b_id INTEGER REFERENCES buckets(b_id), b_played INT, b_currently_playing INT)");


// insert data
echo('inserting super user...<br/>');

// insert - users
$db->exec("INSERT INTO users (u_ip, u_picture, u_admin) VALUES ('127.0.0.1', 'default.png', 1)");

/*
$db->exec("INSERT INTO users (u_ip, u_picture, u_admin) VALUES ('1.1.1.1', '1.1.1.1/user.png', 0)");
$db->exec("INSERT INTO users (u_ip, u_picture, u_admin) VALUES ('3.3.3.3', '3.3.3.3/user.png', 0)");
$db->exec("INSERT INTO users (u_ip, u_picture, u_admin) VALUES ('4.4.4.4', '4.4.4.4/user.png', 0)");

// insert - tracks
$db->exec("INSERT INTO tracks (u_ip, t_filename, t_artist, t_title, t_album, t_length) VALUES ('2.2.2.2', '2.2.2.2/56464156.ogg', 'Klospülung', 'Mundwasser', 'album1', 210)");
$db->exec("INSERT INTO tracks (u_ip, t_filename, t_artist, t_title, t_album, t_length) VALUES ('2.2.2.2', '2.2.2.2/45897614.ogg', 'Dell', 'Fickstuhl', 'album2', 220)");
$db->exec("INSERT INTO tracks (u_ip, t_filename, t_artist, t_title, t_album, t_length) VALUES ('2.2.2.2', '2.2.2.2/78416872.ogg', 'Todesengel', 'HeinzHarald', 'album3', 230)");
$db->exec("INSERT INTO tracks (u_ip, t_filename, t_artist, t_title, t_album, t_length) VALUES ('2.2.2.2', '2.2.2.2/89761236.ogg', 'Analog', 'Südregen', 'album3', 240)");
$db->exec("INSERT INTO tracks (u_ip, t_filename, t_artist, t_title, t_album, t_length) VALUES ('2.2.2.2', '2.2.2.2/89461758.ogg', 'Spast', 'Mongo', 'Vagina', 240)");
$db->exec("INSERT INTO tracks (u_ip, t_filename, t_artist, t_title, t_album, t_length) VALUES ('1.1.1.1', '1.1.1.1/85945616.ogg', 'Spast', 'Mongo', 'Vagina', 280)");
$db->exec("INSERT INTO tracks (u_ip, t_filename, t_artist, t_title, t_album, t_length) VALUES ('3.3.3.3', '3.3.3.3/85945612.ogg', 'Spast', 'Mongo', 'Vagina', 280)");
$db->exec("INSERT INTO tracks (u_ip, t_filename, t_artist, t_title, t_album, t_length) VALUES ('4.4.4.4', '4.4.4.4/85945613.ogg', 'Spast', 'Mongo', 'Vagina', 280)");

// insert - buckets
$db->exec("INSERT INTO buckets (b_is_active) VALUES (1)");
$db->exec("INSERT INTO buckets (b_is_active) VALUES (0)");
$db->exec("INSERT INTO buckets (b_is_active) VALUES (0)");
$db->exec("INSERT INTO buckets (b_is_active) VALUES (0)");
$db->exec("INSERT INTO buckets (b_is_active) VALUES (0)");

// insert - bucketcontents
$db->exec("INSERT INTO bucketcontents (t_id, b_id, b_played, b_currently_playing) VALUES ('1', '1', 1, 0)");
$db->exec("INSERT INTO bucketcontents (t_id, b_id, b_played, b_currently_playing) VALUES ('2', '2', 0, 1)");
$db->exec("INSERT INTO bucketcontents (t_id, b_id, b_played, b_currently_playing) VALUES ('3', '3', 0, 0)");
$db->exec("INSERT INTO bucketcontents (t_id, b_id, b_played, b_currently_playing) VALUES ('4', '4', 0, 0)");
$db->exec("INSERT INTO bucketcontents (t_id, b_id, b_played, b_currently_playing) VALUES ('5', '5', 0, 0)");
$db->exec("INSERT INTO bucketcontents (t_id, b_id, b_played, b_currently_playing) VALUES ('6', '1', 0, 0)");
$db->exec("INSERT INTO bucketcontents (t_id, b_id, b_played, b_currently_playing) VALUES ('7', '1', 0, 0)");
$db->exec("INSERT INTO bucketcontents (t_id, b_id, b_played, b_currently_playing) VALUES ('8', '1', 0, 0)");
*/
// close database connection
$db->close();
unset($db);
echo('done! <br/>');
?>
