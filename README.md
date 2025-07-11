# Questions and Answers Microservice API

## Overview

The Questions and Answers Microservice API repository contains the backend service that powers the Q&A section of an e‑commerce storefront. It was created as a portfolio project to demonstrate scalable API design, caching, and containerized deployment.

## Features

- Post questions related to specific products
- Submit answers to existing questions
- Report content and mark questions or answers as helpful
- Retrieve all questions and answers for a product

## Getting Started

### Prerequisites

Install and configure the following software before running the service:
- Node.js and npm
- Docker
- PostgreSQL
- Redis

### Clone the repository
```bash
git clone https://github.com/your-username/questions-answers-api.git
cd questions-answers-api
```

### Install dependencies
```bash
npm install
```

### Environment variables
Create a `.env` file in the project root and provide the following values:
```bash
PORT=3000
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_NAME=your_db_name
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
```

### Database setup
- Start PostgreSQL and Redis containers:
```bash
docker-compose start redis
docker-compose start db
```

- Migrate the database:
```bash
cat sdc_dump.sql | docker exec -i [container ID] psql -U postgres -d sdc
```

### Running the service
Launch the API with Docker Compose:
```bash
docker-compose start backend
```
The service will be available at [http://localhost:3000](http://localhost:3000).

For a full development environment you can start all services at once:
```bash
docker-compose up -d
```

## API Endpoints
- `GET /qa/questions` &ndash; fetch all questions for a product
- `GET /qa/questions/:question_id/answers` &ndash; fetch all answers for a question
- `POST /qa/questions` &ndash; add a new question
- `POST /qa/questions/:question_id/answers` &ndash; add a new answer
- `PUT /qa/questions/:question_id/helpful` &ndash; mark a question helpful
- `PUT /qa/questions/:question_id/report` &ndash; report a question
- `PUT /qa/questions/:answer_id/helpful` &ndash; mark an answer helpful
- `PUT /qa/questions/:answer_id/report` &ndash; report an answer

## Technologies Used
![Node](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=323330)
![Express](https://img.shields.io/badge/Express.js-808080?style=for-the-badge&logo=express&logoColor=00ff00)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=fff&style=for-the-badge)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

## Contributing
1. Fork this repository.
2. Create a feature branch.
3. Commit your changes and open a pull request.

## License
This project is licensed under the MIT License.