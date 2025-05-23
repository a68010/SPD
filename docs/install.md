# Instalação

## 1. Versão Demo (Docker Compose)

### Pré-requisitos

- Docker  
- Docker Compose  

### Como ligar

1. Clone este repositório e entre na pasta raiz:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd <NOME_DA_PASTA>
   ```
2. Dê permissão de execução ao script (se ainda não tiver):
   ```bash
   chmod +x start.sh
   ```
3. Ligue todos os serviços em background:
   ```bash
   ./start.sh
   ```
4. Verifique se os containers estão a rodar:
   ```bash
   docker-compose ps
   ```
5. Aceda:
   - **Gateway health**: `http://localhost:3000/health`  
   - **UI**: `http://localhost:3001/ui`

### Parar a demo

```bash
docker compose down
```

## 2. Versão Produção (Docker Swarm)

### Pré-requisitos

- Docker  
- Docker Swarm  

### Passos

1. **Inicialize o Swarm** (se ainda não):
   ```bash
   docker swarm init
   ```
2. **Build e tag** das imagens locais:
   ```bash
   docker build -t gateway-service:latest ./gateway-service
   docker build -t kv-node-service:latest ./kv-node-service
   docker build -t replicator-service:latest ./replicator-service
   docker build -t health-monitor:latest ./health-monitor
   docker build -t autoscaler-service:latest ./autoscaler-service
   ```
3. **Crie a rede overlay**:
   ```bash
   docker network create --driver overlay kv-net
   ```
4. **Deploy da Stack**:
   ```bash
   docker stack deploy -c docker-stack.yml kvstore
   ```
5. **Verifique**:
   ```bash
   docker stack services kvstore
   ```
### Parar

```bash
    docker stack rm <nome_da_stack>
```
Para mais informações, consultar README