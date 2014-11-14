<?php
try:
    import pyodbc
except ImportError:
    import odbc as pyodbc

error_reporting(E_ALL);
ini_set('display_errors', '1');

echo "xxxxx";


 
// DBfile = 'tt2.mdb'
// conn = pyodbc.connect('DRIVER={Microsoft Access Driver (*.mdb)};DBQ='+DBfile)
// cursor = conn.cursor()
// SQL = 'SELECT Artist, AlbumName FROM RecordCollection ORDER BY Year;'

// for row in cursor.execute(SQL): # cursors are iterable
// print row.Artist, row.AlbumName

// cursor.close()
// conn.close()

?>
