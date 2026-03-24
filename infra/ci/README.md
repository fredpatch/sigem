# ci

CI/CD workflows and templates.

MONGO_URL=mongodb://admin:CHANGE_ME_STRONG@100.84.234.98:27017/sigem?replicaSet=rs0&authSource=admin&directConnection=true

# Port number

PORT=4000

# JWT Configuration

JWT_SECRET="Yzw8EaAEqfH5IBi9IcN9p4KKhRAfnIZJ7fPasZYZiA4="
JWT_REFRESH_SECRET="X0FXY9Dv5sCefr/cHE31x6r0lV2QjWGzoxto1skL8cw="

# Proxy url

NOTIF_SERVICE_URL=http://localhost:4001
INVENTORY_SERVICE_URL=http://localhost:4002
VEHICLE_SERVICE_URL=http://localhost:4003
REFERENCE_SERVICE_URL=http://localhost:4006
PROVIDER_SERVICE_URL=http://localhost:4010

# Environment

NODE_ENV=development

# Event driven

# EVENTS_DRIVER=noop

EVENTS_DRIVER=kafka
KAFKA_BROKERS=100.84.234.98:9092
KAFKA_CLIENT_ID=sigem-api
KAFKA_TOPICS_NOTIFY=notify.event
KAFKA_TOPICS_LOG=log.action
KAFKA_SSL=false
KAFKA_SASL_ENABLED=false

MARIADB_HOST=100.84.234.98
MARIADB_PORT=3307
MARIADB_USER=admin
MARIADB_PASSWORD=admin
MARIADB_DATABASE=dev_db
