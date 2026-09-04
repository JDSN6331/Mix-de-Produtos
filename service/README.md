# Serviço Windows - Mix de Produtos

Este diretório contém os scripts para transformar seu notebook em um **servidor web permanente** para o **Dashboard Mix de Produtos** na porta `5175`.

## 📋 Pré-requisitos

1. **Python** instalado e configurado no PATH
2. **Pandas e openpyxl** instalados (`pip install pandas openpyxl`)
3. **Permissões de Administrador** para instalar o serviço
4. **NSSM (Non-Sucking Service Manager)** - Baixado automaticamente pelo script

---

## 🚀 Instalação Rápida (Passo a Passo)

### Passo 1: Instalar o serviço
1. Clique com o **botão direito** em `01_instalar_servico.bat`
2. Selecione **"Executar como administrador"**
3. O script irá regenerar o dashboard, baixar o NSSM (se necessário) e registrar o serviço `MixDeProdutos` no Windows.

### Passo 2: Acessar o Dashboard
- **Endereço na rede**: `http://172.16.253.34:5175`
  *(Acessível do seu notebook ou de outros computadores/celulares na mesma rede)*

---

## 🎮 Scripts de Gerenciamento

| Arquivo | Função |
|---|---|
| `01_instalar_servico.bat` | Instala e inicia o serviço no Windows (executar como Admin) |
| `02_iniciar_servico.bat` | Inicia o serviço parado (executar como Admin) |
| `03_parar_servico.bat` | Para o serviço temporariamente (executar como Admin) |
| `04_reiniciar_servico.bat` | Regenera o dashboard e reinicia o serviço (executar como Admin) |
| `05_limpeza_profunda_servidor.bat` | Mata processos Python travados e reinicia (executar como Admin) |
| `06_remover_servico.bat` | Remove o serviço do Windows (executar como Admin) |
| `07_status_servico.bat` | Verifica o status do serviço |

---

## 🔄 Como atualizar os dados

Os dados são lidos **em tempo real** das planilhas Excel a cada acesso ao dashboard. Basta atualizar as planilhas e recarregar a página no navegador.

---

## ⚠️ Observações Importantes

- **Início Automático**: O serviço inicia automaticamente sempre que o notebook é ligado.
- **Logs de Erro/Saída**: Caso precise verificar a execução, os logs ficam salvos na pasta `service\logs\stdout.log` e `service\logs\stderr.log`.
- **Servidor HTTP**: O serviço executa o arquivo `server.py`, um servidor web Python que expõe uma API de dados e serve o dashboard na porta `5175` para toda a rede local (`0.0.0.0:5175`).
- **API de dados**: O endpoint `GET /api/dados` retorna os dados processados das planilhas em formato JSON.
