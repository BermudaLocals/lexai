@echo off
echo 🚀 LEXAI Offer 94697 - PUSH FROM C:\Users\Digital King\Downloads\lexai\lexai-push-ready-94697
echo.
echo Current folder: %CD%
echo.

REM Check if we're in the right folder
if not exist "business\index.html" (
  echo ❌ business\index.html not found
  echo Please cd to C:\Users\Digital King\Downloads\lexai\lexai-push-ready-94697 first
  echo Running: cd /d "C:\Users\Digital King\Downloads\lexai\lexai-push-ready-94697"
  cd /d "C:\Users\Digital King\Downloads\lexai\lexai-push-ready-94697"
)

echo ✅ Files found:
dir /b business\index.html business\oto1\index.html business\oto2\index.html privacy\index.html terms\index.html support\index.html

echo.
echo 📤 READY TO PUSH TO lexai.llc
echo.
echo OPTION 1 - If you use Kimi Code CLI, run:
echo   kimicode deploy --source "C:\Users\Digital King\Downloads\lexai\lexai-push-ready-94697" --target lexai.llc --path /public_html/
echo.
echo OPTION 2 - Manual cPanel:
echo   1. Open cPanel File Manager
echo   2. Go to public_html/business/
echo   3. Upload business\index.html as index.html
echo   4. Upload business\oto1\index.html to public_html/business/oto1/index.html
echo   5. Upload business\oto2\index.html to public_html/business/oto2/index.html
echo   6. Upload privacy\index.html to public_html/privacy/index.html
echo   7. Upload terms\index.html to public_html/terms/index.html
echo   8. Upload support\index.html to public_html/support/index.html
echo.
echo OPTION 3 - FTP (FileZilla):
echo   Local: C:\Users\Digital King\Downloads\lexai\lexai-push-ready-94697\business\index.html
echo   Remote: /public_html/business/index.html
echo.
echo Press any key to open folder in Explorer...
pause >nul
explorer "C:\Users\Digital King\Downloads\lexai\lexai-push-ready-94697"
echo.
echo ✅ After upload, verify https://lexai.llc/business shows YELLOW ADD TO CART
echo Then record 60-sec video and reply in WarriorPlus approval chat
echo.
pause
