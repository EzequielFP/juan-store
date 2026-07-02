$csvFile = "D:\Trabajo\1-OpenCode\Pagina_WAY\juan-store\inventario-final.csv"
$outputJson = "D:\Trabajo\1-OpenCode\Pagina_WAY\juan-store\products.json"
$outputCatalog = "D:\Trabajo\1-OpenCode\Pagina_WAY\juan-store\products-catalog.json"

Add-Type -AssemblyName System.Web.Extensions
$serializer = New-Object System.Web.Script.Serialization.JavaScriptSerializer
$serializer.MaxJsonLength = [int]::MaxValue

function FormatSizes {
    param([string]$s)
    if ([string]::IsNullOrWhiteSpace($s)) { return "" }
    $s = $s.Trim()
    if ($s -match '^(\d+)\s*-\s*(\d+)$') { return "Euro $($matches[1]) al $($matches[2])" }
    if ($s -match '^\d[\d,\s]+$') {
        $nums = [regex]::Split($s, ',\s*') | ForEach-Object { $_.Trim() }
        $filtered = @($nums | Where-Object { $_ -match '^\d+$' })
        if ($filtered.Count -gt 1) { return "Euro $($filtered -join ', ')" }
    }
    if ($s -match '^\d+$') { return "Euro $s" }
    return ""
}

Write-Host "Leyendo CSV..." -ForegroundColor Cyan
$products = Import-Csv -LiteralPath $csvFile -Delimiter ';'

$id = 0
$jsonProducts = @()
$catalogProducts = @()

foreach ($p in $products) {
    if ([string]::IsNullOrWhiteSpace($p.name)) { continue }
    if ($p.name -match '^producto_\d+$') { continue }
    
    $id++
    $sizes = FormatSizes $p.sizes
    $price = [int]$p.price
    if ($price -eq 0) { continue }
    
    $jsonProducts += @{
        image = $p.image
        id = $id
        sizes = $sizes
        price = $price
        category = $p.category
        ref = $p.ref
        name = $p.name.Trim()
        brand = $p.brand
        note = $p.note
    }
    
    $catalogProducts += @{
        id = $id
        name = $p.name.Trim()
        brand = $p.brand
        price = $price
        sizes = $sizes
        image = $p.image
        ref = $p.ref
        category = $p.category
        note = $p.note
    }
}

Write-Host "Total: $id productos" -ForegroundColor Green

# Serialize using JavaScriptSerializer for proper JSON
$jsonOutput = $serializer.Serialize(@{ products = $jsonProducts })
$jsonOutput = $jsonOutput -replace '},', "},`r`n"
$jsonOutput = $jsonOutput -replace '^\{', "{$([char]13)$([char]10)"
$jsonOutput | Set-Content -LiteralPath $outputJson -Encoding UTF8
Write-Host "products.json OK" -ForegroundColor Green

$catalogOutput = $serializer.Serialize(@{ products = $catalogProducts })
$catalogOutput | Set-Content -LiteralPath $outputCatalog -Encoding UTF8
Write-Host "products-catalog.json OK" -ForegroundColor Green

Write-Host "`nPrimeros 10:" -ForegroundColor Cyan
$jsonProducts | Select-Object -First 10 | Format-Table id, name, brand, price, sizes, category -AutoSize
