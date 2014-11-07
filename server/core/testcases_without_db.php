<?php

require_once('../util.php');

$createFile = createTxtFile('trackId', 85);
if($createFile){
    echo 'track id file passt';
}

$createFile = createTxtFile('djImage', 'pfad');
if($createFile){
	echo 'dj image file passt';
}