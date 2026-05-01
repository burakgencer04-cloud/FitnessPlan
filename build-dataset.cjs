$src = "src"
$out = "zips"

New-Item -ItemType Directory -Force -Path $out | Out-Null

Get-ChildItem $src -Directory | ForEach-Object {
    $dir = $_
    $files = Get-ChildItem $dir.FullName -Recurse -File

    for ($i = 0; $i -lt $files.Count; $i += 10) {
        $chunk = $files[$i..([Math]::Min($i+9, $files.Count-1))]
        $zipName = "$out\$($dir.Name)_chunk_$($i/10).zip"

        Compress-Archive -Path $chunk.FullName -DestinationPath $zipName -Force
    }
}