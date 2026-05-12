FROM postgres:16-alpine

ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=password
ENV POSTGRES_DB=restaurant_db

COPY init.sql /docker-entrypoint-initdb.d/init.sql

EXPOSE 5432
