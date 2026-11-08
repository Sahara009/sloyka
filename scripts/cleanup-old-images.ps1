# Удаляет старые картинки, которые сайт больше не использует (проверено 08.11).
# Запуск из папки проекта:  powershell -ExecutionPolicy Bypass -File scripts\cleanup-old-images.ps1
$files = @(
  "public\photos\bonbon-story.webp",
  "public\photos\fleur-nuts-2.webp",
  "public\photos\inserts-colors.webp",
  "public\photos\insta-bonbon-ponchita.webp",
  "public\photos\insta-fleur-pumpkin-muff.webp",
  "public\photos\insta-houses-1.webp",
  "public\photos\insta-houses-2.webp",
  "public\photos\insta-houses-3.webp",
  "public\photos\insta-logo-podiums.webp",
  "public\products\decor-crown.webp",
  "public\products\set-bonbon-piccola-grande.webp",
  "public\products\set-bonbon-piccola.webp",
  "public\products\set-cappottina-muff.webp",
  "public\products\set-cappottina-souffle.webp",
  "public\products\set-fleur-pumpkin-muff.webp",
  "public\products\set-fleur-pumpkin-souffle.webp",
  "public\products\stand-florence-diadem.webp",
  "public\products\waffle-combo-cozy.webp",
  "public\products\waffle-nightlight-butter.webp",
  "public\products\waffle-nightlight-pistachio.webp",
  "public\products\waffle-nightlight-raspberry.webp",
  "public\products\waffle-nightlight-strawberry.webp",
  "public\products\waffle-nightlight.webp",
  "public\products\waffle-round-pistachio.webp",
  "public\products\waffle-round-strawberry.webp",
  "public\products\waffle-square-butter.webp",
  "public\products\waffle-square-pistachio.webp",
  "public\products\waffle-square-raspberry.webp",
  "public\products\waffle-tall-strawberry.webp"
)
foreach ($f in $files) { if (Test-Path $f) { Remove-Item $f; Write-Host "удалён $f" } }
