# Architecture Notes

This service powers the Questions and Answers section of an ecommerce product page. The design artifacts show the project moving from schema design to a PostgreSQL-backed Express API, then adding Redis caching and Docker-based deployment.

## Data Model

The relational model centers on products, questions, answers, and answer photos. The implementation selected PostgreSQL for the primary data store after comparing relational and NoSQL schema options during the design phase.

![Relational database schema](./assets/relational-database-schema.png)

## Runtime Architecture

The deployed service uses these main components:

- Express API for `/qa` routes.
- PostgreSQL for persistent question, answer, and photo data.
- Redis for caching repeated query results.
- Docker Compose for local and EC2 container orchestration.

```text
Client
  -> Express API
  -> Redis cache, when a cached response exists
  -> PostgreSQL, when cache misses or writes occur
```

## Deployment Evolution

The engineering journal records several deployment experiments:

- Local Docker Compose setup with backend, PostgreSQL, and Redis.
- EC2 deployment with database imported from a PostgreSQL dump.
- Single-server deployment with API, cache, and database together.
- Split deployment with cache/database on one EC2 instance and backend on another.
- Split deployment with cache colocated with backend and database isolated.

The strongest architecture lesson from the artifacts is that colocating Redis with the backend reduced network overhead compared with placing Redis beside the database on a separate instance.

## Operational Notes

- Database import was performed from a SQL dump using `psql` inside the Postgres container.
- Docker Compose environment variables controlled the API, database, and Redis configuration.
- Loader.io static-file verification was used for hosted load testing.
- Nginx and Docker scaling were explored as next steps for load balancing and horizontal scaling.
