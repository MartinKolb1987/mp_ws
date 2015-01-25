<?php

require_once('../util.php');
$fileName = '... sdf ...  sdfd . mp3';
if (strpos($fileName, '.') !== false){
	echo strpos($fileName, '.');
	$fileExt = str_replace(' ', '', $fileName);
	$fileExt = explode('.', $fileExt);
	var_dump($fileExt);
	echo '<br>';
	echo '<br>';
	$fileExt = '.' . $fileExt[sizeof($fileExt) - 1];
	var_dump($fileExt);

}
