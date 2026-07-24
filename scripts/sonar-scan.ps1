# Compatibilite : redirige vers la commande npm.
# Prefere : npm run sonar
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root
npm run sonar
exit $LASTEXITCODE
