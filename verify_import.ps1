$ErrorActionPreference = "Stop"

try {
    Write-Host "Authenticating..."
    $tokenResponse = Invoke-RestMethod -Uri "http://127.0.0.1:8789/api/auth/login" -Method Post -ContentType "application/json" -Body '{"password": "admin"}'
    $token = $tokenResponse.token
    Write-Host "Token received."

    Write-Host "Reading bulk data..."
    $products = Get-Content "bulk_test.json" -Raw

    Write-Host "Sending bulk import request..."
    $importResponse = Invoke-RestMethod -Uri "http://127.0.0.1:8789/api/admin/products/bulk" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" } -Body $products

    Write-Host "Import Response:"
    $importResponse | ConvertTo-Json
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}
