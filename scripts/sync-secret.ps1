# Syncs Vercel's NEXTAUTH_SECRET to EXACTLY match the local .env.local value,
# so tokens signed locally verify in production (and vice-versa).
$auth = Get-Content 'C:\Users\Mustapha\AppData\Roaming\com.vercel.cli\Data\auth.json' -Raw | ConvertFrom-Json
$token = $auth.token
$teamId = 'team_I5ushUHaufQqe5pIemmGsHWX'
$projId = 'prj_lrZ6DE4wakTYYenpXLq5sknxuaKn'
$headers = @{ 'Authorization' = "Bearer $token"; 'Content-Type' = 'application/json' }

# local secret (exact, strip only surrounding quotes)
$line = (Get-Content 'C:\Users\Mustapha\Desktop\Hng\hng stage 2\.env.local' | Select-String '^NEXTAUTH_SECRET=').Line
$secretVal = ($line -split '=',2)[1].Trim().Trim('"').Trim("'")
"local secret length: " + $secretVal.Length

# delete existing
$envs = Invoke-RestMethod -Method Get -Uri "https://api.vercel.com/v9/projects/$projId/env?teamId=$teamId" -Headers $headers
foreach ($e in ($envs.envs | Where-Object { $_.key -eq 'NEXTAUTH_SECRET' })) {
  Invoke-RestMethod -Method Delete -Uri "https://api.vercel.com/v9/projects/$projId/env/$($e.id)?teamId=$teamId" -Headers $headers | Out-Null
  "deleted " + $e.id
}

# add local value
$body = @{ key = 'NEXTAUTH_SECRET'; value = $secretVal; type = 'encrypted'; target = @('production') } | ConvertTo-Json
$res = Invoke-RestMethod -Method Post -Uri "https://api.vercel.com/v9/projects/$projId/env?teamId=$teamId" -Headers $headers -Body $body
"added NEXTAUTH_SECRET -> " + $res.id
