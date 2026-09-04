# 🌾 Mix de Produtos — Dashboard Executivo & Inteligência de Kits

Painel executivo e estratégico de inteligência comercial para análise da modalidade **Mix de Produtos**, desenvolvido com arquitetura **Backend Python + Frontend Glassmorphism** e suporte a execução permanente como **Serviço do Windows (NSSM)**.

---

## 🚀 Funcionalidades

- **Dashboard Executivo Completo**: Receita consolidada, quantidade comercializada, pedidos, filiais, vendedores e curva ABC.
- **Inteligência para Montagem de Kits**: Recomendações estratégicas de composição de kits baseadas em ticket médio, giro e complementaridade de produtos.
- **Arquitetura Backend/Frontend**:
  - **Backend (`server.py`)**: Servidor HTTP Python nativo com API REST (`/api/dados`) e cache inteligente em memória RAM (respostas em < 1ms).
  - **Frontend (`index.html`)**: Interface moderna em Glassmorphism Dark (Lovable Design System Agro), gráficos dinâmicos com Chart.js e exportação em Excel.
- **Servidor Interno Permanente**: Scripts na pasta `service/` que transformam o notebook em um servidor interno do Windows que inicializa automaticamente no boot.
- **Atualização Automática**: Detecção de alteração das planilhas Excel em disco — basta atualizar os arquivos que o servidor atualiza o cache automaticamente.
- **Favicon Oficial**: Ícone personalizado integrado para exibição na aba do navegador.

---

## 🌐 Endereço de Acesso na Rede

O servidor roda na porta **`5175`** e escuta em todas as interfaces da máquina (`0.0.0.0`):

👉 **`http://172.16.253.34:5175`**

*(Acessível diretamente pelo navegador no notebook ou por outros dispositivos da mesma rede local)*

---

## 📁 Estrutura do Projeto

```
Mix de Produtos/
│
├── server.py                        # Backend HTTP + API REST (/api/dados) com cache em RAM
├── gerar_dashboard.py               # Gerador do template visual do dashboard (index.html)
├── index.html                       # Frontend oficial da aplicação
├── favicon.svg                      # Favicon vetorial da aplicação
├── Abrir_Dashboard.bat              # Atalho para regenerar e abrir o painel no navegador
├── Modalidade de Venda.xlsx         # Planilha de dados de vendas
├── Produtos e Grupo de Produtos.xlsx# Planilha de cadastro de produtos e grupos
│
├── service/                         # Scripts para gerenciamento do Serviço Windows
│   ├── 01_instalar_servico.bat      # Instala e inicializa o serviço permanente
│   ├── 02_iniciar_servico.bat       # Inicia o serviço parado
│   ├── 03_parar_servico.bat         # Para o serviço temporariamente
│   ├── 04_reiniciar_servico.bat     # Reinicia o serviço com dados/código atualizado
│   ├── 05_limpeza_profunda_servidor.bat # Mata processos travados e reinicia o serviço
│   ├── 06_remover_servico.bat       # Desinstala o serviço do Windows
│   ├── 07_status_servico.bat        # Verifica o status e URL de acesso
│   ├── README.md                    # Manual do serviço Windows
│   └── nssm/                        # Executável do NSSM (Service Manager)
│       └── nssm.exe
│
└── .gitignore
```

---

## ⚙️ Pré-requisitos

1. **Python 3.10+** instalado e configurado no `PATH`
2. Bibliotecas necessárias:
   ```bash
   pip install pandas openpyxl
   ```

---

## 🛠️ Como Utilizar

### Modo 1: Execução como Serviço do Windows (Recomendado)

Basta instalar uma única vez para que a solução fique permanentemente disponível sempre que o notebook for ligado:

1. Abra a pasta `service/`;
2. Clique com o botão direito em **`01_instalar_servico.bat`** e selecione **"Executar como Administrador"**;
3. Acesse `http://172.16.253.34:5175` em qualquer navegador da rede.

### Modo 2: Execução Manual

```bash
python server.py
```
Acesse `http://172.16.253.34:5175` no seu navegador.
