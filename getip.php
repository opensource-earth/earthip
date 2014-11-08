<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

echo "xxxxx";

//读取mdb数据库例程
$conn = new com("ADODB.Connection");
$connstr = "DRIVER={Microsoft Access Driver (*.mdb)}; DBQ=". realpath("tt2.mdb");
$conn->Open($connstr);
$rs = new com("ADODB.RecordSet")
//$rs->Open("select * from s2",$conn,1,1);
/*while(! $rs->eof) {
	$f = $rs->Fields(1);
	echo $f->value;
	$rs->MoveNext();
}*/
?>
