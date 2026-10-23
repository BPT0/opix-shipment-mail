# index.html + css/ + js/ 를 하나의 HTML로 묶어 QA용 Artifact 페이지를 만든다.
#   powershell -File scripts/build-artifact.ps1 -Out <출력 경로>
param([Parameter(Mandatory = $true)][string]$Out)

$root = Split-Path -Parent $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding($false)
function Read-Text($rel) { [System.IO.File]::ReadAllText((Join-Path $root $rel), $utf8) }

$html = Read-Text 'index.html'
$title = [regex]::Match($html, '<title>(.*?)</title>').Groups[1].Value
$body = [regex]::Match($html, '(?s)<body>(.*?)<script src=').Groups[1].Value
$scripts = [regex]::Matches($html, '<script src="([^"]+)"></script>') | ForEach-Object { $_.Groups[1].Value }

$css = Read-Text 'css/style.css'
$banner = Read-Text 'scripts/qa-banner.html'
$bannerCss = @'
.qa-banner { max-width: 1120px; margin: 0 auto 16px; padding: 10px 14px; border-radius: 8px; background: var(--brand-soft); color: var(--brand-d); font-size: 13px; display: flex; flex-wrap: wrap; gap: 4px 12px; }
.qa-banner .qa-note { flex-basis: 100%; font-size: 12px; color: var(--ink-2); }
'@

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("<title>$title</title>")
[void]$sb.AppendLine('<style>')
[void]$sb.AppendLine($css)
[void]$sb.AppendLine($bannerCss)
[void]$sb.AppendLine('</style>')
[void]$sb.AppendLine($banner)
[void]$sb.AppendLine($body)
[void]$sb.AppendLine('<script>')
foreach ($s in $scripts) { [void]$sb.AppendLine((Read-Text $s)) }
[void]$sb.AppendLine('</script>')

[System.IO.File]::WriteAllText($Out, $sb.ToString(), $utf8)
Write-Output ("wrote {0} ({1} bytes)" -f $Out, (Get-Item $Out).Length)
