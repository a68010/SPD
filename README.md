# Distributed Key–Value Store

Este repositório contém duas formas de executar o sistema:

1. **Demo local** com Docker Compose  
2. **Deploy em produção** com Docker Swarm

---

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

### Testar o CRUD

```bash
# CREATE
curl -i -X PUT http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '{"data":{"key":"demo","value":"123"}}'

# READ
curl -i http://localhost:3000/?key=demo

# DELETE
curl -i -X DELETE http://localhost:3000/?key=demo
```

### Parar a demo

```bash
docker compose down
```

---

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
   — você deverá ver:
   ```
   NAME                     MODE         REPLICAS   IMAGE
   kvstore_kv-node          replicated   3/3        kv-node-service:latest
   kvstore_gateway          replicated   1/1        gateway-service:latest
   kvstore_replicator       replicated   1/1        replicator-service:latest
   kvstore_health-monitor   replicated   1/1        health-monitor:latest
   kvstore_autoscaler       replicated   1/1        autoscaler-service:latest
   ```
6. **Teste o CRUD** via gateway (porta 3000):
   ```bash
   curl -i -X PUT http://<MANAGER_IP>:3000/ \
     -H "Content-Type: application/json" \
     -d '{"data":{"key":"foo","value":"bar"}}'
   curl -i http://<MANAGER_IP>:3000/?key=foo
   curl -i -X DELETE http://<MANAGER_IP>:3000/?key=foo
   ```
7. **Escabilidade Manual** (opcional):
   ```bash
   docker service scale kvstore_kv-node=5
   ```
   — o autoscaler também ajusta réplicas automaticamente conforme CPU.

---

## 3. Extras

- **Logs do Autoscaler**:
  ```bash
  docker service logs -f kvstore_autoscaler
  ```
- **Monitoramento de CPU**:
  ```bash
  docker stats --format "table {{.Name}}\t{{.CPUPerc}}"
  ```
- **Testes automatizados**:
  - `test_api.sh` para CRUD básico.
