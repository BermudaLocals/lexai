# fix_and_push.ps1 - Fix file names in C:\Users\Digital King\Downloads\lexai and push to GitHub
# Your files are named like Routes-Business-Central.js - this renames them to correct structure

Write-Host "=== FIXING FILES IN C:\Users\Digital King\Downloads\lexai ===" -ForegroundColor Yellow

$base = "C:\Users\Digital King\Downloads\lexai"
Set-Location $base

# Create folders
New-Item -ItemType Directory -Force -Path "$base\config" | Out-Null
New-Item -ItemType Directory -Force -Path "$base\middleware" | Out-Null
New-Item -ItemType Directory -Force -Path "$base\routes" | Out-Null

Write-Host "Created folders: config, middleware, routes" -ForegroundColor Green

# Function to find and copy file with various possible names
function FindAndCopy($patterns, $dest) {
  foreach ($pat in $patterns) {
    $found = Get-ChildItem -Path $base -Filter $pat -File -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
      Copy-Item $found.FullName $dest -Force
      Write-Host "✅ FOUND $($found.Name) -> $dest" -ForegroundColor Green
      return $true
    }
  }
  # Also check root with dash names
  $dashFiles = Get-ChildItem -Path $base -File | Where-Object { $_.Name -like "*Business*Central*" -or $_.Name -like "*locales*" -or $_.Name -like "*language*" }
  foreach ($f in $dashFiles) {
    if ($dest -like "*business.js" -and $f.Name -like "*Business*") {
      Copy-Item $f.FullName $dest -Force
      Write-Host "✅ FOUND $($f.Name) -> $dest" -ForegroundColor Green
      return $true
    }
    if ($dest -like "*locales.js" -and $f.Name -like "*locales*") {
      Copy-Item $f.FullName $dest -Force
      Write-Host "✅ FOUND $($f.Name) -> $dest" -ForegroundColor Green
      return $true
    }
    if ($dest -like "*language.js" -and $f.Name -like "*language*") {
      Copy-Item $f.FullName $dest -Force
      Write-Host "✅ FOUND $($f.Name) -> $dest" -ForegroundColor Green
      return $true
    }
  }
  Write-Host "❌ NOT FOUND: $dest - tried $patterns" -ForegroundColor Red
  return $false
}

# Fix the files you mentioned: "Routes-Business-Central.js"
Write-Host "`n--- Fixing your files ---" -ForegroundColor Yellow

# If you have Routes-Business-Central.js in root
if (Test-Path "$base\Routes-Business-Central.js") {
  Copy-Item "$base\Routes-Business-Central.js" "$base\routes\business.js" -Force
  Write-Host "✅ Routes-Business-Central.js -> routes\business.js" -ForegroundColor Green
}
if (Test-Path "$base\routes-business-central.js") {
  Copy-Item "$base\routes-business-central.js" "$base\routes\business.js" -Force
  Write-Host "✅ routes-business-central.js -> routes\business.js" -ForegroundColor Green
}

# Check other possible names
FindAndCopy @("config_locales.js","config-locales.js","*locales*.js") "$base\config\locales.js"
FindAndCopy @("middleware_language.js","middleware-language.js","*language*.js") "$base\middleware\language.js"
FindAndCopy @("routes_business_central.js","routes-business-central.js","*business*central*.js","*Business*Central*.js") "$base\routes\business.js"

# Create legal.js from business.js if missing
if ((Test-Path "$base\routes\business.js") -and -not (Test-Path "$base\routes\legal.js")) {
  Copy-Item "$base\routes\business.js" "$base\routes\legal.js" -Force
  (Get-Content "$base\routes\legal.js") -replace 'L\.business','L.legal' | Set-Content "$base\routes\legal.js"
  Write-Host "✅ Created routes\legal.js from business.js (both sides pull central)" -ForegroundColor Green
}

Write-Host "`n--- Final structure ---" -ForegroundColor Yellow
Get-ChildItem "$base\config" | Format-Table Name
Get-ChildItem "$base\middleware" | Format-Table Name
Get-ChildItem "$base\routes" | Format-Table Name

Write-Host "`n--- Verifying central locales ---" -ForegroundColor Yellow
if (Test-Path "$base\config\locales.js") {
  $content = Get-Content "$base\config\locales.js" -Raw
  if ($content -match "JA" -and $content -match "ZH" -and $content -match "KO") {
    Write-Host "✅ Asia JA 🇯🇵 ZH 🇨🇳 KO 🇰🇷 found in config\locales.js" -ForegroundColor Green
  }
  if ($content -match "49" -and $content -match "150" -and $content -match "450") {
    Write-Host "✅ Pricing `$49 / `$150 / `$450 found" -ForegroundColor Green
  }
  if ($content -match "business" -and $content -match "legal") {
    Write-Host "✅ Both sides business + legal in central file" -ForegroundColor Green
  }
}

Write-Host "`n--- Git push ---" -ForegroundColor Yellow
git status
if (-not (Test-Path "$base\.git")) {
  git init
  git remote add origin https://github.com/BermudaLocals/lexai.git
}
git config user.name "BermudaLocals"
git config user.email "lexai@lexai.llc"
git add config/locales.js middleware/language.js routes/business.js routes/legal.js
git add -A
git commit -m "feat: central i18n config/locales.js - EN/ES/PT/FR/JA/ZH/KO Asia - both sides pull same file - pricing $49/$150/$450 - NDA $350 vs $49 - profitable - fingerprint LEXAI-V3.0.0-20260817"
git branch -M main
git push -u origin main

Write-Host "`n✅ DONE! https://github.com/BermudaLocals/lexai" -ForegroundColor Green
Write-Host "Live: lexai.llc/business?lang=JA  JA Asia working" -ForegroundColor Cyan
Write-Host "Both sides pull from config/locales.js" -ForegroundColor Cyan
Pause
