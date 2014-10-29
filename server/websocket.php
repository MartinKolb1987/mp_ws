<?php
// https://code.google.com/p/phpwebsocket/
// FIX server.php:
// http://phpforum.de/forum/showpost.php?p=1502477&postcount=13
// 22.10.2014, master group mobile experience:
// added sendDataToAllClientsViaWebsocket() function

// includes
// require_once('db/db.php');
// require_once('users.php');
// require_once('tracks.php');
require_once('client_actions.php');
require_once('util.php');

set_time_limit(0);
ob_implicit_flush();

// > php -q websocket.php
global $websocketPort;

$master  = WebSocket("localhost",$websocketPort);

$sockets = array($master);
$users   = array();
$debug   = false;

while(true){
    $changed = $sockets;
    socket_select($changed,$write,$except, NULL);
    foreach($changed as $socket){
        if($socket==$master){
            $client=socket_accept($master);
            if($client<0){ console("socket_accept() failed"); continue; }
            else{ connect($client); }
        } else {
            $bytes = @socket_recv($socket,$buffer,2048,0);
            if($bytes==0){ disconnect($socket); } else{
                $user = getuserbysocket($socket);
                if(!$user->handshake){ dohandshake($user,$buffer); }
                else{ getClientDataViaWebsocket($user->socket, $users, $buffer); }
            }
        }
    }
}

//---------------------------------------------------------------

/* getClientDataViaWebsocket()
 * get client all data through websocket
 */
function getClientDataViaWebsocket($user, $allUsers, $msg){
    $msg = unwrap($msg);
    $jsonDecoded = json_decode($msg);
    $sendJson = '';
    $route = $jsonDecoded->route;
    $type = $jsonDecoded->type;

    switch($route) {
        case 'home':
            
            if($type === 'checkForNewUpdates'){
                $data = getCurrentMusicSystemInfo($route, $type);    
                sendDataToClientViaWebsocket($user, $data);
            } else if($type === 'getCurrentlyPlaying'){
                // currentlyPlaying
                $data = getCurrentlyPlaying($route, $type);
                sendDataToClientViaWebsocket($user, $data);
            } else if($type === 'getPlaylist') {
                // user playlist
                $data = getPlaylist($route, $type);
                sendDataToClientViaWebsocket($user, $data);
            } 

            break;
        case 'settings':
            // userImage
            $data = getUserImage($route, $type);
            sendDataToClientViaWebsocket($user, $data);
            break;
    }

    // print $jsonDecoded->route;
    // print $jsonDecoded->type;
    // print $jsonDecoded->data;

    // sendDataToClientViaWebsocket($user, $msg);
    // sendDataToClientViaWebsocket($user, 'servus');
    // sendDataToAllClientsViaWebsocket($allUsers, '{"route":"' .  $jsonDecoded->route . '","info":{"currentlyPlaying":{"id":1,"artist":"MUCC","title":"1R","album":"Blubb","length":225,"picture":"","downvote":0},"status":{"users":"30","internetAccess":true}}}');
    // sendDataToAllClientsViaWebsocket($allUsers, '{"route":"home","info":{"currentlyPlaying":{"id":1,"artist":"MUCC","title":"1R","album":"Houyoku","length":225,"picture":"","downvote":0},"status":{"users":"30","internetAccess":true}}}');
}

function sendDataToClientViaWebsocket($client,$msg){
    $msg = wrap($msg);
    $sent = socket_write($client, $msg);
}

function sendDataToAllClientsViaWebsocket($allUsers, $msg){
    $msg = wrap($msg);
    foreach($allUsers as $user){
        $sent = socket_write($user->socket, $msg);
    }
}

function WebSocket($address,$port){
    $master=socket_create(AF_INET, SOCK_STREAM, SOL_TCP)     or die("socket_create() failed");
    socket_set_option($master, SOL_SOCKET, SO_REUSEADDR, 1)  or die("socket_option() failed");
    socket_bind($master, $address, $port)                    or die("socket_bind() failed");
    socket_listen($master,20)                                or die("socket_listen() failed");
    echo "Master socket  : ".$master."\n";
    echo "Listening on   : ".$address." port ".$port."\n\n";
    return $master;
}

function connect($socket){
    global $sockets,$users;
    $user = new User();
    $user->id = uniqid();
    $user->socket = $socket;
    array_push($users,$user);
    array_push($sockets,$socket);
    console($socket." CONNECTED!");
}

function disconnect($socket){
    global $sockets,$users;
    $found=null;
    $n=count($users);
    for($i=0;$i<$n;$i++){
        if($users[$i]->socket==$socket){ $found=$i; break; }
    }
    if(!is_null($found)){ array_splice($users,$found,1); }
    $index = array_search($socket,$sockets);
    socket_close($socket);
    console($socket." DISCONNECTED!");
    if($index>=0){ array_splice($sockets,$index,1); }
}

function dohandshake($user,$buffer){
    console("\nRequesting handshake...");
    console($buffer);
    list($resource,$host,$origin,$key) = getheaders($buffer);
    console("Handshaking...");

    $upgrade  = "HTTP/1.1 101 Web Socket Protocol Handshake\r\n" .
                "Upgrade: WebSocket\r\n" .
                "Connection: Upgrade\r\n" .
                "Sec-WebSocket-Accept: ".base64_encode(sha1($key."258EAFA5-E914-47DA-95CA-C5AB0DC85B11",true))."\r\n".
                "\r\n";
    socket_write($user->socket,$upgrade);

    $user->handshake=true;
    console($upgrade);
    console("Done handshaking...");
    return true;
}

function getheaders($req){
    $r=$h=$o=null;
    if(preg_match("/GET (.*) HTTP/"   ,$req,$match)){ $r=$match[1]; }
    if(preg_match("/Host: (.*)\r\n/"  ,$req,$match)){ $h=$match[1]; }
    if(preg_match("/Origin: (.*)\r\n/",$req,$match)){ $o=$match[1]; }
    if(preg_match("/Sec-WebSocket-Key: (.*)\r\n/",$req,$match)){ $key1=$match[1]; }
    if(preg_match("/\r\n(.*?)\$/",$req,$match)){ $data=$match[1]; }
    return array($r,$h,$o,$key1);
}

function getuserbysocket($socket){
    global $users;
    $found=null;
    foreach($users as $user){
        if($user->socket==$socket){ $found=$user; break; }
    }
    return $found;
}

function say($msg=""){ 
    echo $msg."\n"; 
}

function wrap($msg=""){

    $len = strlen($msg);

    // 0x81 = first and last bit set (fin, opcode=text) 
    $header = chr(0x81);

    // extended 32bit payload
    if ($len >= 126) {
        $header .= chr(126) . pack('n', $len);
    } else {
        $header .= chr($len);
    }

    $msg=$header.$msg;
    
    return $msg;
}

function unwrap($msg=""){ 

    $firstMask=     bindec("10000000");
    $secondMask=    bindec("01000000");//im not doing anything with the rsvs since we arent negotiating extensions...
    $thirdMask=     bindec("00100000");
    $fourthMask=    bindec("00010000");
    $firstHalfMask= bindec("11110000");
    $secondHalfMask=bindec("00001111");
    $payload="";
    $firstHeader=ord(($msg[0]));
    $secondHeader=ord($msg[1]);
    $key=Array();
    $fin=(($firstHeader & $firstMask)?1:0);
    $rsv1=$rsv2=$rsv3=0;
    $opcode=$firstHeader & (~$firstHalfMask);//TODO: make the opcode do something. it extracts it but the program just assumes text;
    $masked=(($secondHeader & $firstMask) !=0);
    $length=$secondHeader & (~$firstMask);
    $index=2;

    if($length==126){
        $length=ord($msg[$index])+ord($msg[$index+1]);
        $index+=2;
    }

    if($length==127){
        $length=ord($msg[$index])+ord($msg[$index+1])+ord($msg[$index+2])+ord($msg[$index+3])+ord($msg[$index+4])+ord($msg[$index+5])+ord($msg[$index+6])+ord($msg[$index+7]);
        $index+=8;
    }

    if($masked){
        for($x=0;$x<4;$x++){
            $key[$x]=ord($msg[$index]);
            $index++;
        }
    }
    
    for($x=0;$x<$length;$x++){
        $msgnum=ord($msg[$index]);
        $keynum=$key[$x % 4];
        $unmaskedKeynum=$msgnum ^ $keynum;
        $payload.=chr($unmaskedKeynum);
        $index++;
    }

    if($fin!=1){
        return $payload.processMsg(substr($msg,$index));
    } else {
        return $payload;
    }
}

function console($msg=""){ 
    global $debug; if($debug){ echo $msg."\n"; } 
}

class User{
    var $id;
    var $socket;
    var $handshake;
}

?>