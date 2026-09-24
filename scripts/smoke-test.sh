#!/usr/bin/env bash
#
# Smoke test del sitio publicado.
#
# Un deploy "exitoso" no garantiza que el sitio quedó bien: el job puede
# terminar en verde y el dominio seguir sirviendo otra cosa, o faltar un asset.
# Esto pide la página real y verifica tres cosas:
#
#   1. Responde 200 y trae el HTML de la app.
#   2. El bundle que el HTML referencia también responde 200.
#   3. El dominio de producción sirve EXACTAMENTE el build que se acaba de
#      desplegar — no el anterior.
#
# El punto 3 es el que importa: sin él, un deploy que no llegó a promoverse
# pasa desapercibido, que es como el sitio estuvo seis semanas sirviendo una
# versión vieja sin que nadie lo notara.
#
# Uso:
#   SITE_URL=https://shop.ezyhome.app bash scripts/smoke-test.sh
#   DEPLOY_URL=https://abc123.ezyhome-storefront.pages.dev  (opcional, lo pasa el CI)
set -euo pipefail

SITE_URL="${SITE_URL:-https://shop.ezyhome.app}"
DEPLOY_URL="${DEPLOY_URL:-}"

MAX_INTENTOS="${MAX_INTENTOS:-10}"
ESPERA_SEG="${ESPERA_SEG:-6}"

fallar() {
  echo ""
  echo "SMOKE TEST FALLIDO: $1"
  echo ""
  echo "El deploy publicó algo que no responde como se espera."
  echo "Para volver atrás: panel de Cloudflare Pages › el proyecto › Deployments ›"
  echo "el último deployment que funcionaba › 'Rollback to this deployment'."
  echo "Es instantáneo: reapunta el dominio, no recompila nada."
  exit 1
}

# Primer <script type="module" src="..."> del HTML: el bundle de entrada.
extraer_bundle() {
  grep -oE 'assets/index-[A-Za-z0-9_-]+\.js' <<<"$1" | head -1
}

echo "Smoke test contra $SITE_URL"

html=""
for intento in $(seq 1 "$MAX_INTENTOS"); do
  if html=$(curl -fsS --max-time 20 "$SITE_URL" 2>/dev/null); then
    bundle_prod=$(extraer_bundle "$html" || true)
    if [ -n "$bundle_prod" ]; then
      echo "  intento $intento: 200, bundle $bundle_prod"
      break
    fi
  fi
  echo "  intento $intento: todavía no responde como se espera, reintento en ${ESPERA_SEG}s"
  sleep "$ESPERA_SEG"
  html=""
done

[ -n "$html" ] || fallar "$SITE_URL no respondió 200 tras $MAX_INTENTOS intentos."

grep -q '<div id="root">' <<<"$html" ||
  fallar "el HTML no contiene <div id=\"root\">; no parece la app."

bundle_prod=$(extraer_bundle "$html" || true)
[ -n "$bundle_prod" ] ||
  fallar "no se encontró ningún assets/index-*.js en el HTML. ¿Cambió el formato del build?"

curl -fsS --max-time 20 -o /dev/null "$SITE_URL/$bundle_prod" ||
  fallar "el HTML referencia /$bundle_prod, que no se puede descargar."
echo "  bundle descargable"

# El dominio de producción tiene que servir el deployment recién creado.
if [ -n "$DEPLOY_URL" ]; then
  bundle_nuevo=""
  for intento in $(seq 1 "$MAX_INTENTOS"); do
    html_nuevo=$(curl -fsS --max-time 20 "$DEPLOY_URL" 2>/dev/null || true)
    bundle_nuevo=$(extraer_bundle "$html_nuevo" || true)
    [ -n "$bundle_nuevo" ] && break
    sleep "$ESPERA_SEG"
  done

  [ -n "$bundle_nuevo" ] ||
    fallar "no se pudo leer el deployment nuevo en $DEPLOY_URL."

  if [ "$bundle_prod" != "$bundle_nuevo" ]; then
    # Puede ser propagación: reintentamos antes de dar por perdido.
    for intento in $(seq 1 "$MAX_INTENTOS"); do
      sleep "$ESPERA_SEG"
      html=$(curl -fsS --max-time 20 "$SITE_URL" 2>/dev/null || true)
      bundle_prod=$(extraer_bundle "$html" || true)
      [ "$bundle_prod" = "$bundle_nuevo" ] && break
      echo "  producción sirve $bundle_prod, se esperaba $bundle_nuevo; reintento"
    done
  fi

  [ "$bundle_prod" = "$bundle_nuevo" ] ||
    fallar "producción sirve $bundle_prod pero el deploy nuevo es $bundle_nuevo: el dominio quedó apuntando a un build viejo."
  echo "  producción sirve el build recién desplegado"
else
  echo "  (sin DEPLOY_URL: no se verificó que producción sea el build nuevo)"
fi

echo ""
echo "Sitio publicado y respondiendo."
