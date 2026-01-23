FROM mongo:8.0
COPY compose/mongo/keys/keyfile.local /etc/mongo-keyfile
RUN chmod 400 /etc/mongo-keyfile && chown mongodb:mongodb /etc/mongo-keyfile
