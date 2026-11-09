# Asks for the Azure Speech key without showing it, then generates the A2 Academy recordings.
# The key is only passed to this one run: it isn't printed, saved to a file or added to the project.
Set-Location (Join-Path $PSScriptRoot '..\..')
Write-Host ''
Write-Host 'Azure Speech: paste your KEY below (right-click or Ctrl+V), then press Enter.' -ForegroundColor Cyan
Write-Host 'Nothing will appear while you paste. That is normal.' -ForegroundColor Cyan
$secure = Read-Host 'Key' -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
$key = ([Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)).Trim().Trim('"').Trim("'")
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
$region = (Read-Host 'Region (shown next to the key, for example westeurope)').Trim().ToLower()
if ($key.Length -lt 20 -or $key.Contains(' ') -or -not $region) {
  Write-Host 'That does not look like an Azure key and region. Nothing was generated. Run this again.' -ForegroundColor Red
  return
}
$env:AZURE_SPEECH_KEY = $key
$env:AZURE_SPEECH_REGION = $region
try {
  npx tsx scripts/audio/generate.ts
} finally {
  Remove-Item Env:AZURE_SPEECH_KEY -ErrorAction SilentlyContinue
  Remove-Item Env:AZURE_SPEECH_REGION -ErrorAction SilentlyContinue
  $key = $null
}
Write-Host ''
Write-Host 'Finished. Go back to Claude and say: audio done' -ForegroundColor Green
