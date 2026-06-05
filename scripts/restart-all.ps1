
param()

# Restart backend and frontend dev servers (Windows PowerShell)
$repoRoot = (Split-Path -Path $PSScriptRoot -Parent)
Write-Output "Restarting dev servers in $repoRoot"

# Detect PowerShell executable (prefer pwsh, fallback to powershell)
$pwshCmd = Get-Command pwsh -ErrorAction SilentlyContinue
if ($pwshCmd) { $psExe = $pwshCmd.Source } else {
  $psCmd = Get-Command powershell -ErrorAction SilentlyContinue
  if ($psCmd) { $psExe = $psCmd.Source } else { $psExe = $null }
}

if (-not $psExe) {
  Write-Error "No PowerShell executable found (pwsh or powershell). Start servers manually."
  exit 1
}

Write-Output "Using PowerShell: $psExe"

# Kill processes listening on Blindfold dev ports
$ports = @(3011,5174)
foreach ($p in $ports) {
  try {
    $conns = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
      if ($c.OwningProcess) {
        Write-Output "Stopping process $($c.OwningProcess) on port $p"
        Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
      }
    }
  } catch {
    # ignore
  }
}

Start-Sleep -Milliseconds 300

Write-Output "Starting backend..."
Start-Process -FilePath $psExe -ArgumentList "-NoExit","-Command","cd '$repoRoot'; npm run dev:backend" -WorkingDirectory $repoRoot

Start-Sleep -Milliseconds 200

Write-Output "Starting frontend..."
Start-Process -FilePath $psExe -ArgumentList "-NoExit","-Command","cd '$repoRoot'; npm run dev:frontend" -WorkingDirectory $repoRoot

Write-Output "Done. Two new PowerShell windows were opened for backend and frontend."
