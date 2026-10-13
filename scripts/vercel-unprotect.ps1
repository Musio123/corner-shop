# Disables Vercel "Deployment Protection" (Vercel Authentication) so the site is public.
$auth = Get-Content 'C:\Users\Mustapha\AppData\Roaming\com.vercel.cli\Data\auth.json' -Raw | ConvertFrom-Json
$token = $auth.token
$projId = 'prj_lrZ6DE4wakTYYenpXLq5sknxuaKn'
$teamId = 'team_I5ushUHaufQqe5pIemmGsHWX'
$headers = @{ 'Authorization' = "Bearer $token"; 'Content-Type' = 'application/json' }
$body = @{ ssoProtection = $null } | ConvertTo-Json
try {
  $resp = Invoke-RestMethod -Method Patch -Uri "https://api.vercel.com/v9/projects/$projId`?teamId=$teamId" -Headers $headers -Body $body
  "PATCH OK"
  "ssoProtection: " + ($resp.ssoProtection | ConvertTo-Json -Compress)
  "passwordProtection: " + ($resp.passwordProtection | ConvertTo-Json -Compress)
} catch {
  "ERROR: " + $_.Exception.Message
  if ($_.ErrorDetails) { $_.ErrorDetails.Message }
}
