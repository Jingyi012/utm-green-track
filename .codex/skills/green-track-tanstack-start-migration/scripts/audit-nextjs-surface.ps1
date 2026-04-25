param(
    [string]$FrontendPath = "."
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $FrontendPath)) {
    throw "Frontend path '$FrontendPath' does not exist."
}

$packageJson = Join-Path $FrontendPath "package.json"
$appPath = Join-Path $FrontendPath "src/app"
$envPath = Join-Path $FrontendPath ".env"

Write-Host "== GreenTrack Next.js Audit ==" -ForegroundColor Green
Write-Host "Frontend path: $FrontendPath"

if (Test-Path $packageJson) {
    Write-Host ""
    Write-Host "-- package.json scripts and framework deps --" -ForegroundColor Cyan
    $pkg = Get-Content $packageJson -Raw | ConvertFrom-Json

    if ($pkg.scripts) {
        $pkg.scripts.PSObject.Properties |
            Sort-Object Name |
            ForEach-Object { Write-Host ("script:{0} = {1}" -f $_.Name, $_.Value) }
    }

    foreach ($section in @("dependencies", "devDependencies")) {
        if ($pkg.$section) {
            $pkg.$section.PSObject.Properties |
                Where-Object { $_.Name -match "^(next|@tanstack/|vite|eslint-config-next|@ant-design/nextjs-registry)$" } |
                Sort-Object Name |
                ForEach-Object { Write-Host ("{0}:{1} = {2}" -f $section, $_.Name, $_.Value) }
        }
    }
}

if (Test-Path $appPath) {
    Write-Host ""
    Write-Host "-- app router files --" -ForegroundColor Cyan
    Get-ChildItem -Path $appPath -Recurse -File |
        Where-Object { $_.Name -in @("page.tsx", "layout.tsx", "not-found.tsx", "route.ts") } |
        Sort-Object FullName |
        ForEach-Object {
            $relative = Resolve-Path -Relative $_.FullName
            Write-Host $relative
        }
}

Write-Host ""
Write-Host "-- next/* imports and runtime APIs --" -ForegroundColor Cyan
$patterns = @(
    "next/",
    "next/navigation",
    "next/link",
    "next/image",
    "next/font",
    "Metadata",
    "generateMetadata",
    "redirect\(",
    "notFound\("
)

foreach ($pattern in $patterns) {
    Write-Host ""
    Write-Host ("pattern: {0}" -f $pattern) -ForegroundColor Yellow
    rg -n --glob "!node_modules/**" --glob "!.next/**" $pattern $FrontendPath
}

if (Test-Path $envPath) {
    Write-Host ""
    Write-Host "-- environment variables --" -ForegroundColor Cyan
    Get-Content $envPath | ForEach-Object { Write-Host $_ }
}

Write-Host ""
Write-Host "-- NEXT_PUBLIC and process.env usage --" -ForegroundColor Cyan
rg -n --glob "!node_modules/**" --glob "!.next/**" "NEXT_PUBLIC|process\.env|import\.meta\.env" $FrontendPath
