# -*- coding: utf-8 -*-
"""
Servidor HTTP — Mix de Produtos
Backend que serve o dashboard e expõe a API de dados.

Endpoints:
  GET /            → index.html (dashboard)
  GET /api/dados   → JSON com os registros processados das planilhas Excel
  GET /<arquivo>   → arquivos estáticos do diretório
"""

import json
import mimetypes
import os
import sys
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

import pandas as pd

# Forçar UTF-8 nos fluxos de saída (evita UnicodeEncodeError em serviços Windows)
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Diretório raiz da aplicação (onde está este arquivo)
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

# Porta do servidor
PORT = 5175


def find_file(filename, search_dirs):
    """Localiza um arquivo em múltiplos diretórios."""
    for d in search_dirs:
        candidate = os.path.join(d, filename)
        if os.path.exists(candidate):
            return candidate
    return None


def carregar_dados():
    """
    Lê as planilhas Excel e retorna um dicionário com os dados processados.
    Retorna: {"records": [...], "dt_ini": "...", "dt_fim": "...", "agora": "..."}
    """
    search_dirs = [ROOT_DIR, os.path.dirname(ROOT_DIR)]

    # 1. Localizar arquivos Excel
    vendas_path = find_file("Modalidade de Venda.xlsx", search_dirs)
    if not vendas_path:
        vendas_path = find_file("Modalidade de Vendas.xlsx", search_dirs)
    produtos_path = find_file("Produtos e Grupo de Produtos.xlsx", search_dirs)

    if not vendas_path:
        raise FileNotFoundError("Arquivo 'Modalidade de Venda.xlsx' não encontrado!")
    if not produtos_path:
        raise FileNotFoundError("Arquivo 'Produtos e Grupo de Produtos.xlsx' não encontrado!")

    print(f"[API] Lendo planilhas: {vendas_path}, {produtos_path}")

    # 2. Carregar dados
    df_vendas = pd.read_excel(vendas_path)
    df_produtos = pd.read_excel(produtos_path)

    # 3. Mapear Grupos
    col_grupo_cod = None
    col_grupo_desc = None
    for c in df_produtos.columns:
        c_str = str(c).lower()
        if "grupo" in c_str and ("código" in c_str or "codigo" in c_str):
            col_grupo_cod = c
        elif "grupo" in c_str and ("descri" in c_str or "nome" in c_str):
            col_grupo_desc = c

    if col_grupo_cod is None or col_grupo_desc is None:
        col_grupo_cod = df_produtos.columns[3]
        col_grupo_desc = df_produtos.columns[4]

    grupo_map = (
        df_produtos[[col_grupo_cod, col_grupo_desc]]
        .dropna()
        .drop_duplicates()
        .set_index(col_grupo_cod)[col_grupo_desc]
        .to_dict()
    )

    # 4. Filtrar Mix de Produtos
    col_mod = None
    for c in df_vendas.columns:
        if "modalidade" in str(c).lower():
            col_mod = c
            break
    if col_mod is None:
        col_mod = df_vendas.columns[7]

    mix_df = df_vendas[df_vendas[col_mod].astype(str).str.strip() == "Mix de Produtos"].copy()

    if len(mix_df) == 0:
        return {"records": [], "dt_ini": "", "dt_fim": "", "agora": datetime.now().strftime("%d/%m/%Y às %H:%M")}

    # Mapear colunas de vendas
    col_map = {}
    for c in df_vendas.columns:
        c_lower = str(c).lower()
        if "data" in c_lower and ("início" in c_lower or "inicio" in c_lower):
            col_map["data"] = c
        elif "número do pedido" in c_lower or "numero do pedido" in c_lower:
            if "erp" not in c_lower and "pedido" not in col_map:
                col_map["pedido"] = c
        elif "matricula" in c_lower or "matrícula" in c_lower:
            col_map["matricula"] = c
        elif "nome da conta" in c_lower or "cooperado" in c_lower:
            col_map["cooperado"] = c
        elif "filial" in c_lower:
            col_map["filial"] = c
        elif "campanha" in c_lower:
            col_map["campanha"] = c
        elif "vendedor" in c_lower:
            col_map["vendedor"] = c
        elif "código do produto" in c_lower or "codigo do produto" in c_lower:
            col_map["cod_produto"] = c
        elif "nome do produto" in c_lower or ("produto" in c_lower and "grupo" not in c_lower and "cod" not in c_lower):
            if "produto" not in col_map:
                col_map["produto"] = c
        elif "grupo de produto" in c_lower:
            col_map["grupo"] = c
        elif "quantidade" in c_lower:
            col_map["quantidade"] = c
        elif "preço total" in c_lower or "preco total" in c_lower:
            col_map["preco_total"] = c
        elif "status" in c_lower:
            col_map["status"] = c
        elif "valor do pedido" in c_lower:
            col_map["valor_pedido"] = c

    def get_val(row, key, default=None, conv=None):
        col_name = col_map.get(key)
        val = row[col_name] if col_name and col_name in row else default
        if pd.isna(val):
            val = default
        if conv and val is not None:
            try:
                return conv(val)
            except Exception:
                return default
        return val

    records = []
    datas_list = []

    for _, row in mix_df.iterrows():
        data_raw = get_val(row, "data")
        if isinstance(data_raw, datetime) or hasattr(data_raw, "strftime"):
            data_str = data_raw.strftime("%d/%m/%Y")
            data_dt = pd.to_datetime(data_raw)
        else:
            data_dt = pd.to_datetime(str(data_raw), format="%d/%m/%Y", errors="coerce")
            data_str = data_dt.strftime("%d/%m/%Y") if pd.notna(data_dt) else str(data_raw)

        if pd.notna(data_dt):
            datas_list.append(data_dt)

        grp_cod = get_val(row, "grupo")
        grp_nome = grupo_map.get(grp_cod, "Outros")
        if pd.isna(grp_nome) or not grp_nome:
            grp_nome = "Outros"

        rec = {
            "data": data_str,
            "pedido": int(get_val(row, "pedido", 0, int)),
            "matricula": int(get_val(row, "matricula", 0, int)),
            "cooperado": str(get_val(row, "cooperado", "")).strip(),
            "filial": str(get_val(row, "filial", "")).strip(),
            "campanha": str(get_val(row, "campanha", "")).strip() if pd.notna(get_val(row, "campanha")) else "Sem Campanha",
            "vendedor": str(get_val(row, "vendedor", "")).strip(),
            "produto": str(get_val(row, "produto", "")).strip(),
            "grupo": str(grp_nome).strip(),
            "quantidade": float(get_val(row, "quantidade", 0.0, float)),
            "preco_total": float(get_val(row, "preco_total", 0.0, float)),
            "status": str(get_val(row, "status", "")).strip(),
            "valor_pedido": float(get_val(row, "valor_pedido", 0.0, float)),
        }
        records.append(rec)

    if datas_list:
        datas_list.sort()
        dt_ini = datas_list[0].strftime("%d/%m/%Y")
        dt_fim = datas_list[-1].strftime("%d/%m/%Y")
    else:
        dt_ini = ""
        dt_fim = ""

    agora = datetime.now().strftime("%d/%m/%Y às %H:%M")

    print(f"[API] {len(records)} registros processados. Período: {dt_ini} a {dt_fim}")

    return {
        "records": records,
        "dt_ini": dt_ini,
        "dt_fim": dt_fim,
        "agora": agora,
    }


# Cache em memória inteligente
_CACHE = {
    "payload": None,
    "vendas_mtime": None,
    "produtos_mtime": None,
}


def obter_dados_em_cache():
    """
    Retorna o payload JSON já codificado em bytes.
    Se as planilhas Excel não foram alteradas no disco, retorna da memória INSTANTANEAMENTE (< 1ms).
    Se foram alteradas, reprocessa e atualiza o cache automaticamente.
    """
    search_dirs = [ROOT_DIR, os.path.dirname(ROOT_DIR)]
    vendas_path = find_file("Modalidade de Venda.xlsx", search_dirs)
    if not vendas_path:
        vendas_path = find_file("Modalidade de Vendas.xlsx", search_dirs)
    produtos_path = find_file("Produtos e Grupo de Produtos.xlsx", search_dirs)

    if not vendas_path or not produtos_path:
        dados = carregar_dados()
        return json.dumps(dados, ensure_ascii=False).encode("utf-8")

    v_mtime = os.path.getmtime(vendas_path)
    p_mtime = os.path.getmtime(produtos_path)

    if (
        _CACHE["payload"] is not None
        and _CACHE["vendas_mtime"] == v_mtime
        and _CACHE["produtos_mtime"] == p_mtime
    ):
        return _CACHE["payload"]

    print("[CACHE] Atualizando dados em memoria a partir dos arquivos Excel...")
    dados = carregar_dados()
    payload = json.dumps(dados, ensure_ascii=False).encode("utf-8")
    _CACHE["payload"] = payload
    _CACHE["vendas_mtime"] = v_mtime
    _CACHE["produtos_mtime"] = p_mtime
    print(f"[CACHE] Concluido! {len(payload)} bytes prontos em memoria.")
    return payload


class MixDeProdutosHandler(BaseHTTPRequestHandler):
    """Handler HTTP personalizado: API de dados + servidor de arquivos estáticos."""

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/dados":
            self._handle_api_dados()
        elif path in ("/favicon.ico", "/favicon.svg"):
            self._serve_favicon()
        else:
            self._serve_static(path)

    def _serve_favicon(self):
        """Serve o favicon da aplicacao."""
        fav_path = os.path.join(ROOT_DIR, "favicon.svg")
        if os.path.isfile(fav_path):
            try:
                with open(fav_path, "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "image/svg+xml")
                self.send_header("Content-Length", str(len(content)))
                self.send_header("Cache-Control", "public, max-age=86400")
                self.end_headers()
                self.wfile.write(content)
                return
            except Exception:
                pass
        self.send_error(404, "Favicon not found")

    def _handle_api_dados(self):
        """Endpoint GET /api/dados — retorna os dados processados em JSON (instantâneo via cache)."""
        try:
            payload = obter_dados_em_cache()

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(payload)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.end_headers()
            self.wfile.write(payload)

        except FileNotFoundError as e:
            self._send_json_error(404, str(e))
        except Exception as e:
            print(f"[ERRO] /api/dados: {e}", file=sys.stderr)
            self._send_json_error(500, f"Erro interno: {e}")

    def _serve_static(self, path):
        """Serve arquivos estáticos do ROOT_DIR."""
        # Mapear / para /index.html
        if path == "/" or path == "":
            path = "/index.html"

        # Segurança: impedir path traversal
        safe_path = os.path.normpath(path.lstrip("/"))
        if safe_path.startswith(".."):
            self.send_error(403, "Forbidden")
            return

        file_path = os.path.join(ROOT_DIR, safe_path)

        if not os.path.isfile(file_path):
            self.send_error(404, "File not found")
            return

        # Determinar tipo MIME
        content_type, _ = mimetypes.guess_type(file_path)
        if content_type is None:
            content_type = "application/octet-stream"

        try:
            with open(file_path, "rb") as f:
                content = f.read()

            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error(500, f"Erro ao ler arquivo: {e}")

    def _send_json_error(self, code, message):
        """Envia resposta de erro em JSON."""
        payload = json.dumps({"erro": message}, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, format, *args):
        """Logging para stdout (capturado pelo NSSM)."""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        sys.stdout.write(f"[{timestamp}] {args[0]}\n")
        sys.stdout.flush()


# Endereço IP padrão da aplicação na rede
SERVER_IP = "172.16.253.34"


def main():
    os.chdir(ROOT_DIR)

    print("=" * 57)
    print("  MIX DE PRODUTOS - SERVIDOR WEB")
    print(f"  Porta: {PORT} | Bind: 0.0.0.0")
    print("=" * 57)
    print(f"  Diretorio: {ROOT_DIR}")
    print(f"  Dashboard: http://{SERVER_IP}:{PORT}")
    print(f"  API Dados: http://{SERVER_IP}:{PORT}/api/dados")
    print("=" * 57)
    print("[INFO] Carregando dados das planilhas Excel na memoria...")
    sys.stdout.flush()
    try:
        obter_dados_em_cache()
        print("[OK] Dados em memoria e prontos para resposta instantanea!")
    except Exception as e:
        print(f"[AVISO] Erro no pre-carregamento: {e}")
    print()
    sys.stdout.flush()

    server = HTTPServer(("0.0.0.0", PORT), MixDeProdutosHandler)

    try:
        print(f"Servidor iniciado em http://{SERVER_IP}:{PORT}")
        sys.stdout.flush()
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
        server.server_close()


if __name__ == "__main__":
    main()
