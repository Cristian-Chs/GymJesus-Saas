@echo off
npm run build > build_output_bat.txt 2>&1
echo Build finished with code %ERRORLEVEL% >> build_output_bat.txt
