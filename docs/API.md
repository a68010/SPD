# Manual da API

## Endpoints do Gateway (porta 3000)

### PUT `/`
- **Descrição**: cria ou atualiza o par (key,value).
- **Request**  
  - Headers: `Content-Type: application/json`  
  - Body:
    ```json
    {
      "data": {
        "key": "<string>",
        "value": "<string>"
      }
    }
    ```
- **Response**  
  - `200 OK` se bem-sucedido  
  - `400 Bad Request` (payload inválido)

### GET `/`
- **Descrição**: recupera valor de uma chave.
- **Request**  
  - Query string: `?key=<string>`
- **Response**  
  - `200 OK`  
    ```json
    {
      "data": {
        "value": "<string>"
      }
    }
    ```
  - `400 Bad Request` (falta parâmetro)  
  - `404 Not Found` (chave não existe)

### DELETE `/`
- **Descrição**: remove par (key,value).
- **Request**  
  - Query string: `?key=<string>`
- **Response**  
  - `200 OK`  
  - `400 Bad Request`  
  - `404 Not Found`

### GET `/health`
- **Descrição**: health-check do Gateway.
- **Response**  
  ```json
  { "status": "ok" }
