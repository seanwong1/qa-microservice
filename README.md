# Questions and Answers Microservice API

## Overview

The Questions and Answers Microservice API is a scalable and performant solution for handling user questions and answers on our e-commerce website.

## Features

User can post questions related to products.
User can post answers to existing questions.
User can report both questions and answers and mark them as helpful.
User can view all questions and answers for a specific product.

## Installation

### Prerequisites

Before getting started, make sure you have the following tools installed:

Node.js and npm
Docker
PostgreSQL
Redis

#### Clone the repository:
```
git clone https://github.com/your-username/questions-answers-api.git
cd questions-answers-api
```

#### Install the dependencies:
```npm install```

### Environment Configuration:
Create a .env file in the root directory and set the following environment variables:
```
PORT=3000
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=your_db_port
DB_NAME=your_db_name
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
```

### Database Setup

#### Start PostgreSQL and Redis using Docker Compose:
```
docker-compose start redis
docker-compose start db
```

#### Run database migrations:
```cat sdc_dump.sql | docker exec -i [container ID] psql -U postgres -d sdc```

#### Usage

Start the Express.js server:
```
docker-compose start backend
```
The API will be accessible at http://localhost:3000.

Alternatively for development purposes or for a monolithic API:
```
docker-compose up -d
```

## API Endpoints

GET /qa/questions: Get all questions for a specific product.
GET /qa/questions/:question_id/answers: Get all answers for a specific question.
POST /qa/questions: Post a new question for a specific product.
POST /qa/questions/:question_id/answers: Post a new answer for a specific question.
PUT /qa/questions/:question_id/helpful: Mark a question helpful.
PUT /qa/questions/:question_id/report: Report a question.
PUT /qa/questions/:answer_id/helpful: Mark an answer helpful.
PUT /qa/questions/:answer_id/report: Report an answer.

## Technologies

![Node](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Javascript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=323330)
![Express](https://img.shields.io/badge/Express.js-808080?style=for-the-badge&logo=express&logoColor=00ff00)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=fff&style=for-the-badge)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

## Contributing

Contributions to improve the API are welcome. To contribute, follow these steps:

Fork the repository.
Create a new branch for your feature or bug fix.
Make changes and commit them.
Push your branch to your forked repository.
Submit a pull request to the main repository.

## License

This project is licensed under the MIT License.