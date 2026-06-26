@echo off
echo Installing MySQL80 service...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --install MySQL80
echo Starting MySQL80 service...
net start MySQL80
echo Done.
pause
