---
sidebar_position: 2
---

# Docker Compose Configuration

 > This is docker compose file the keycloak

```yaml
version: '3.8'
services:
  keycloak:
    image: quay.io/keycloak/keycloak:21.1
    container_name: keycloak
    command: start --import-realm --hostname-strict=false
    environment:
      - KEYCLOAK_ADMIN=admin
      - KEYCLOAK_ADMIN_PASSWORD=admin
      - KC_DB=mysql
      - KC_DB_URL=jdbc:mysql://db_keycloak:3306/keycloak
      - KC_DB_USERNAME=root
      - KC_DB_PASSWORD=root
      - KC_CACHE=local
      - KC_HTTP_ENABLED=true
    depends_on:
      db_keycloak:
        condition: service_healthy
      redis:
        condition: service_healthy
    ports:
      - "8080:8080"
    networks:
      protocol:
        ipv4_address: 172.16.239.15

  db_keycloak:
    image: mysql:8.2.0-oracle
    container_name: db_keycloak
    environment:
      - MYSQL_ROOT_PASSWORD=root
      - MYSQL_DATABASE=keycloak
    volumes:
      - ./mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 10s
      retries: 5
    networks:
      protocol:
        ipv4_address: 172.16.239.16

  redis:
    image: redis:latest
    container_name: redis
    ports:
      - "6379:6379"
    networks:
      protocol:
        ipv4_address: 172.16.239.30
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mysql_data:
    driver: local

networks:
  protocol:
    external: true
```
