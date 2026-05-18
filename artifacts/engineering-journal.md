# SDC Engineering Journal

**Small group activity:** Performance Testing

## Review Notes

Use this section as a quick interview-prep guide. The dated journal below preserves the original project timeline; these notes summarize the most important technical decisions, milestones, tradeoffs, and lessons from the journal plus git history.

### Project Summary

- Built a Questions and Answers microservice for an ecommerce product page.
- Designed relational and NoSQL schemas, then implemented the service with PostgreSQL because the Q&A data had clear relationships between products, questions, answers, and answer photos.
- Implemented an Express API for question retrieval, answer retrieval, posting questions/answers, marking content helpful, and reporting content.
- Used PostgreSQL JSON aggregation to shape nested API responses close to the database instead of assembling large nested objects in JavaScript.
- Added Redis as a cache layer for repeated read requests.
- Containerized the service with Docker and Docker Compose, then deployed and tested different EC2 layouts.
- Used Postman, k6, and Loader.io to validate correctness and performance.

### Git History Milestones

- `3267357` on 2023-04-13: initialized the Node/Express project, package files, config file, placeholder database folders, and starter tests.
- `9aceeb4` on 2023-04-14: added Dockerfile and Docker Compose basics so the backend could run in a container.
- `42aeda3` on 2023-04-15: added PostgreSQL to Docker Compose, establishing the primary database service.
- `4820471` on 2023-04-18: completed initial PostgreSQL and MongoDB schema work, documenting both relational and NoSQL data-model options.
- `68ada26` on 2023-04-18: connected the backend container to the PostgreSQL container through Docker networking.
- `e6878dd` on 2023-04-18: installed `pg`, enabling the Express server to query PostgreSQL.
- `e0fbb99` on 2023-04-18: verified PostgreSQL returned data from the loaded dataset.
- `9666431` on 2023-04-20: added first working GET routes for `/qa/questions` and `/qa/questions/:question_id/answers`.
- `09dabe1` on 2023-04-22: improved the answers query to include photo URLs and return a response object with `question`, `page`, `count`, and `results`.
- `97759f8`, `f62dc41`, and `6efcc3b` on 2023-05-02: implemented helpful/report routes for questions and answers.
- `ca6886f` on 2023-05-04: completed the main `/qa/questions` route using `json_build_object`, `json_agg`, subqueries, and nested answer/photo aggregation.
- `af4f091` on 2023-05-08: split server startup from the Express app, making the app easier to import for testing.
- `858de4b` on 2023-05-08: added Supertest route tests for GET and POST behavior.
- `532d864` on 2023-05-12: added the k6 local stress test script and began formal load testing.
- `02d25e7` and `f30bec9` on 2023-05-16 to 2023-05-21: adjusted deployment settings and served a static file for Loader.io verification.
- `c50f2bd` on 2023-05-26: added Redis, a Docker Compose cache service, and cache-aware GET routes returning `fromCache` metadata.
- `24f4caf` on 2023-07-24: expanded the README with setup, endpoints, technologies, and deployment notes.
- `f3fdd17` on 2025-07-11: moved hard-coded database and Redis credentials into environment-based config.
- `b9c0a0e` on 2025-07-11: refactored the monolithic server into controllers and modular routers.
- `220a27a` on 2026-05-18: added the artifact set and converted the engineering journal into Markdown.
- `5efc78b` on 2026-05-18: promoted high-signal artifacts into architecture and performance docs.

### Interview Talking Points

- PostgreSQL vs MongoDB: The data had natural joins and hierarchical responses, but relational integrity across products, questions, answers, and photos made PostgreSQL a strong fit. MongoDB was explored during schema design, but the final service used PostgreSQL.
- SQL-side response shaping: The `/qa/questions` endpoint used `json_build_object`, `json_agg`, `json_object_agg`, and subqueries to return nested API-ready data. This reduced JavaScript-side object assembly and kept heavy data shaping close to the database.
- Indexing impact: Initial GET requests were slow on the full dataset. After adding indexes on hot query paths, captured Postman latency for `/qa/questions` improved from about `1888 ms` to about `211 ms`.
- Cache-aside Redis strategy: The API checks Redis before querying PostgreSQL. On a cache miss, it queries Postgres and stores the result. This improved repeated-read performance in Loader.io tests.
- Load testing approach: k6 was useful for local stress testing and finding saturation behavior, while Loader.io gave hosted evidence for deployed EC2 configurations.
- Deployment tradeoff: Splitting services across EC2 instances was not automatically faster. Cache placement mattered; colocating Redis with the backend performed better than putting cache with the database and forcing backend-cache traffic across instances.
- Operational learning: Database migration to EC2 was handled with `pg_dump`, `scp`, and `psql` inside the Postgres container. This worked, but a reproducible migration/init workflow would be better for future maintainability.
- Refactor story: The app started as a single `server/index.js`, then moved to `server/app.js`, route modules, and controllers. This made the project easier to test and reason about.

### STAR-Style Stories

#### Optimizing Slow PostgreSQL Reads

- Situation: The initial `/qa/questions` route worked but was too slow against the production-sized dataset.
- Task: Improve read latency without changing the API contract.
- Action: Used `EXPLAIN ANALYZE`, identified hot query paths, added PostgreSQL indexes, and retested with Postman and k6.
- Result: Captured Postman latency improved from about `1888 ms` before indexing to about `211 ms` after indexing.

#### Building Nested API Responses

- Situation: The frontend expected questions with nested answers and answer photos.
- Task: Return the full shape efficiently from a normalized relational schema.
- Action: Built a PostgreSQL query using CTEs/subqueries and JSON aggregation functions instead of assembling the entire object in JavaScript.
- Result: The route returned frontend-compatible nested data while keeping the most expensive transformation inside PostgreSQL.

#### Adding Redis Caching

- Situation: Indexed queries were faster, but repeated reads still hit PostgreSQL.
- Task: Reduce repeated database work and improve response time under load.
- Action: Added Redis to Docker Compose, connected an async Redis client in Express, checked the cache before querying Postgres, and stored query results on cache misses.
- Result: Loader.io tests showed cached runs with low average response times, including a captured `10000 clients over 1 min` run at about `62 ms` average response time.

#### Deployment And Load Testing On EC2

- Situation: Local tests did not fully represent hosted behavior.
- Task: Deploy the service and compare load-test performance across architectures.
- Action: Migrated the database dump to EC2, verified endpoints through Postman, configured Loader.io, then tested single-server, split-server, cache colocated with backend, and no-cache layouts.
- Result: Learned that splitting infrastructure can introduce network latency and that cache/backend colocation performed better than separating backend from cache.

### Lessons Learned And Follow-Ups

- Use database-managed IDs with sequences/identity columns and `RETURNING id` instead of `SELECT MAX(id) + 1`, which is unsafe under concurrent writes.
- Include route, entity ID, page, and count in Redis cache keys to avoid collisions and incorrect paginated cache hits.
- Invalidate or update cache entries after POST, helpful, and report mutations.
- Convert the database setup from manual dump/import steps into a checked-in schema and reproducible migration flow.
- Add stronger isolated tests for controllers/routes, pagination, cache behavior, and error handling.
- Keep deployment credentials in environment variables and avoid hard-coded secrets in Docker Compose or application code.
- Treat load-test screenshots as evidence, but document test parameters and conclusions in text so future readers do not need to infer results from images.

## Apr 11, 2023

- Set up Trello board.
- Set up GitHub organization.
  - Create fork of front end (Zephyr).
  - Create repo for server microservice.

## Apr 13, 2023

- Initialize project folder structure.
- Initialize node modules and tests.

## Apr 15, 2023

- Create schemas for relational and NoSQL databases.
- Select MongoDB and PostgreSQL as databases.
- Research connecting Docker with PostgreSQL and backend.

![Relational database schema](./relational-database-schema.png)

![NoSQL database schema](./nosql-database-schema.png)

## Apr 18, 2023

- Attempted to have Docker run a `docker-entrypoint` SQL script to create database and tables.
  - Not working at the moment.
- Modify `docker-compose` file to connect both Postgres and backend containers.
- Manually copied schema in SQL file and created tables in `psql`.
- Uploaded datasets to Postgres container.
- Modified schema to store Unix epoch time as a string.
- Use this command to import CSV data into Postgres database:

```sql
\COPY answers FROM '/tmp/data_set/answers.csv' DELIMITER ',' CSV HEADER;
```

- PostgreSQL justification: `[ENTER HERE]`.
- Do research on how Docker works to clean up files/folders with environment variables.
  - Can use `.env` file to store DB environment variables and access in Dockerfile with `${}`.

![Postgres database initialized](./postgres-database-initialized.png)

![ETL import complete](./etl-import-complete.png)

## Apr 20, 2023

- Start coding out routes for server.
- Was able to return results from one table.
- PostgreSQL (`pg` module) has named parameters.
- Do research on how to combine results from different tables into one.
  - Perhaps results of one as array of another.
- Can define dynamic routes by using `:` before a variable in Express.

## Apr 22, 2023

- Didn't do much, trying to figure out how to make subqueries work and return the entire JSON object formatted correctly.
  - Would like to do this using purely PostgreSQL commands since building the JSON object in JavaScript is not efficient.

## May 4, 2023

- Work on completing routes.
- For the GET route for `/qa/questions`:
  - Needed to use subqueries to connect tables together.
  - Can use `json_agg(json_build_object())`.
  - Can literally build object as you see fit with keys and values defined.
    - Probably comes with drawbacks?
    - Is there a way using just SQL commands and join tables?
  - The `WITH` command uses the subquery as a variable which can be accessed by other queries.
  - Thanks to Stanley for helping gain insight into the problem.

## May 6, 2023

- Completed routes.
- Finished the POST route for `/qa/questions/:question_id/answers`.
  - Since I needed to insert into both the `answers` and `answers_photos` tables, I decided to use multiple queries sequentially with `.then()` and `.catch()`.
  - Also needed to use the `UNNEST` statement and create arrays for the photo IDs and the answer ID to fill up each row.
    - There is definitely a better way to do this.
    - The correct answer I am imagining uses some kind of auto increment and I wouldn't have to worry about creating the array.
      - The IDs would increment naturally and wouldn't need to be included in the `INSERT` statement.
  - Also needed to use queries to `SELECT` the max ID of the `answer` and `answers_photos` tables.
    - I thought using the Postgres equivalent of the auto increment statement would help, but the index ID started at 0 and incremented by 1 each time I tried to `INSERT` a row.
      - The query would fail, but the ID would increment by 1.
      - Didn't want to insert until the final ID.
      - Decided to use `SELECT max(id)`.
    - It is possible that if multiple users make POST requests and insert at the same time, while one user is inserting, the ID will increment and the next user will `SELECT` that max ID, which will result in their `INSERT` statement inserting the wrong ID for the wrong data.
      - Does Postgres work like this?
  - The correct answer would still use multiple, smaller queries chained together instead of one big query.
- Verified that frontend can connect to backend.
  - However, the routes for getting questions are extremely slow.
    - Will need to work on this.
  - Also, since `date_written` is stored as a string, will need to convert to Unix epoch on the server side of things then return entire JSON object.
  - Or send back as a string and let frontend handle conversion to a human-readable format.

![Postman GET answers before index, slow response](./postman-get-answers-before-index-slow.png)

![Postman GET questions before index, slow response](./postman-get-questions-before-index-slow.png)

## May 9, 2023

- Not much, lecture.

## May 11, 2023

Stress testing begins.

- Had a kerfuffle with code from testing.
- Database didn't connect because I commented it out for testing.
- Ran `EXPLAIN ANALYZE` on the database tables.
- Did a Postman on the two GET routes.
- Wrote out a k6 test for the `/qa/questions` route.

![Postgres EXPLAIN ANALYZE before index](./postgres-explain-analyze-before-index.png)

![k6 before index initial test 1](./k6-before-index-initial-test-1.png)

![k6 before index initial test 2](./k6-before-index-initial-test-2.png)

![k6 before index ramped to 1000 VUs](./k6-before-index-1000-vus.png)

![k6 before index ramped to 2000 VUs](./k6-before-index-2000-vus.png)

![k6 before index ramped to 3000 VUs](./k6-before-index-3000-vus.png)

![k6 before index ramped to 10000 VUs](./k6-before-index-10000-vus.png)

- Ramped up the number of virtual users until a stress point.
  - Requests started to fail at 10000 VUs.

## May 13, 2023

- Do research on how to implement a Postgres index.
  - `CREATE INDEX name_of_index ON table(table_column)`.
- Ran Postman on routes to see whether query speed has increased.

![Postman GET answers after index, fast response](./postman-get-answers-after-index-fast.png)

![Postman GET questions after index, fast response](./postman-get-questions-after-index-fast.png)

- Rerun k6 tests for `/qa/questions` route after implementing indexing.

![k6 stress test after index](./k6-after-index-stress-test.png)

## May 16, 2023

- Attempted to deploy application with Docker.
- Realized that I would need to migrate the local database to the EC2 instance database.
- Researched several ways of doing this without having to redo the entire ETL process and recreating the entire database on the EC2 instance.
  - Somehow save the volume and upload that into the EC2 instance.
  - Containers would just be created with `docker-compose up`, but the database is not online.

## May 18, 2023

- Uploaded the relevant CSV files onto the EC2 instance using the `scp` command and was able to transfer an entire folder.
  - In case further research doesn't yield possible results of skipping this process.
  - Would have to recreate database using the CSV files.
- Did some more research about how to migrate the database.
- The command `pg_dump` piped into `psql` seems like a good option, but the first command is returning an error.
  - Role root does not exist.
  - Where to run the `pg_dump` command and have it dump out database as a SQL file that I can then `scp` into the EC2 instance.
- Did more research about how to fix this error.

## May 20, 2023

- Successfully made a dump of the local database using:

```bash
pg_dump -U postgres -F p -f /tmp/sdc_dump.sql sdc
```

- Upload to EC2 instance with `scp`.
- Increased EC2 instance size with modify volume size.
- In the Docker Compose file, bind the dump file to a folder/file in the Postgres instance.
- Since Docker Compose creates both the Postgres and backend container:
  - Need to first run `docker start [name of container]`.
  - To start only that container, in this case Postgres.
- To get into Postgres instance, since there is no Docker GUI:
  - `docker exec -it [name of container] bash`.
    - Can find container by using `docker container ls -a`.
  - Brings you to the terminal of that instance.
  - Can then run your commands below.
- Created a new database called `sdc` in the EC2 Postgres instance.
  - Import the SQL file into the `sdc` database.
  - Command: `psql -U postgres sdc < /tmp/sdc_dump.sql`.

![API connected to Postgres database](./api-connected-to-postgres-database.png)

- Also within the Docker Compose file need to change `3000:3000` to `80:3000` or `443:3000` since we don't want the port number after the URL, so need to bind port 3000 inside the container to port 80/443 outside.
- Then can run `docker-compose up`.
  - If need to run when terminal is closed can probably run `docker-compose up &`.
  - Can probably run `htop` and select the running Docker instance to close.
  - Or `ps aux` and then kill the process ID.
  - Or there is probably some `docker-compose down` command somewhere.
- Initial GET requests using Postman tend to be below 50 ms.

![Postman GET questions product 7165](./postman-get-questions-product-7165.png)

![Postman GET questions product 2](./postman-get-questions-product-2.png)

### Stressed

- Using loader.io.
  - Serve static file for verification.
- Create tests parameters.

![Loader one-server test 1 configuration](./loader-one-server-test-1-config.png)

![Loader one-server test 2 configuration](./loader-one-server-test-2-config.png)

![Loader one-server test 3 configuration](./loader-one-server-test-3-config.png)

- Test results.

![Loader one-server test 1 running results](./loader-one-server-test-1-running-results.png)

![Loader one-server test 1 final results](./loader-one-server-test-1-final-results.png)

![Loader one-server test 2 results](./loader-one-server-test-2-results.png)

![Loader one-server test 3 results](./loader-one-server-test-3-results.png)

- Seems too good to be true.
- About a doubling in response time when users are at 10000 compared to 1000.
- Will need to run more tests since there is no failure yet, 100% success rate.

## May 23, 2023

- Doing research on database caching, 5 main strategies:
  - Cache-aside.
  - Read-through.
  - Write-through.
  - Write-back.
  - Write-around.
- Was able to add Redis server via the Docker Compose file.
- Will need to do more research on how to utilize Redis in the Express server.

## May 25, 2023

- Implemented Redis into server.
- `npm install redis`.
- Added code to connect to a Redis client.
- Added code for Redis to set a result from a previous query.
- When the same query is sent then Redis will send the result from that same query.
- Initial testing on local server speeds that may be faster, but probably not a statistically significant amount faster.

![Postman Redis cache local test](./postman-redis-cache-local-test.png)

- Tells you if result is from cache or not for testing purposes.
- Will need to deploy this iteration of SDC and stress test with Loader to see if speed increased.

## May 27, 2023

- Deployed SDC with caching from Thursday.
- Recreate Loader verification.
- Reran tests with same configurations as last time stressed.

![Loader cache test 1 results](./loader-cache-test-1-results.png)

![Loader cache test 2 results](./loader-cache-test-2-results.png)

![Loader cache test 3 results](./loader-cache-test-3-results.png)

![Loader cache test 4 results](./loader-cache-test-4-results.png)

- All tests are a few milliseconds faster than before which leads to the conclusion that caching is faster, but is this statistically significant?
- Also, in test 4 where only one `product_id` is being tested, one would expect the response time to be much faster due to caching than compared to a test like test 2 where multiple `product_id`s are being tested.
  - Leads me to believe that the bottleneck isn't located in the query or in the Express server code.
  - Speed is probably locked behind load balancing and/or using multiple EC2 instances.
- Doing research on how to implement Nginx load balancing.
- Research how to use multiple instances of EC2 with Docker.

## May 30, 2023

- Added Nginx Docker instance.
- Started to add `nginx.conf`.
  - Couldn't figure out why `nginx.conf` file wasn't being connected as a volume.
  - Fixed.
- TODO:
  - Figure out how to create multiple instances of the backend.
  - Figure out how backend instances will talk to DB instance.

## Jun 1, 2023

- Able to set up `nginx.conf` file, partially working.
  - Need to somehow get parameters passed correctly.
- Did research on how to scale with Docker.
  - Thought about creating multiple containers, but there is a Docker Compose flag: `--scale [name of container]=[number to scale to]`.
  - Docker Compose file also has an option to create a range of ports like `3000-3050:3000`.
    - Meaning ports from 3000-3050 are generated and assigned to 3000.
  - Thus when linking via Nginx, each can be linked in turn if using round robin.
- Current understanding:
  - Nginx is at port 4000, should change to 80 later.
    - User goes to this port and Nginx will redirect to the duplicated servers in turn.
- TODO:
  - Figure out how to pass parameters in Nginx.
  - Should also test to see if Nginx and servers are linked correctly.
    - Scale to 2 servers.
    - Console log a unique message when Nginx is pinged.
    - Each created server does respond when pinged individually though.

## Jun 14, 2023

- Recreate database volume.
  - Import data from dump with:

```bash
cat sdc_dump.sql | docker exec -i [container ID] psql -U postgres -d sdc
```

- Research Docker Swarm: <https://docs.docker.com/engine/swarm/stack-deploy/>.
- Found out that the database connection needs to be asynchronous, otherwise Express attempts to connect only once, especially when doing Docker Swarm.
- In new AWS EC2 instances:
  - Need to add user to Docker group: `sudo usermod -a -G docker [user]`.
- In the manager AWS EC2 instance:
  - Need to open up port 2377 in security.
- Found out that there was no `.env` file in the EC2 instance, so no port was defined.
- Took a break from working on making Docker Swarm work.
- Set up multiple EC2 instances.
  - Cloned GitHub SDC into each.
  - Pointed the backend to the other instance using the DNS name.
    - Example: `ip-172-31-2-235.us-west-1.compute.internal`.
  - Started up the cache and DB on one instance.

![EC2 cache and database server](./ec2-cache-and-database-server.png)

- Started up the backend on another instance.

![EC2 backend server](./ec2-backend-server.png)

- Ran an initial Postman request to confirm that this two-instance setup is working.

![Postman split-server request success](./postman-split-server-request-success.png)

- Ran this through a loader.io test.

![Loader split cache/DB and backend results](./loader-split-cache-db-and-backend-results.png)

![Loader split cache/DB and backend config](./loader-split-cache-db-and-backend-config.png)

- Test results might not be good because the cache and backend are on different servers, so there is a delay in information transfer.
- Decided to move the cache server into the backend server, leaving the database by itself.
- Loader.io:

![Loader cache with backend results](./loader-cache-with-backend-results.png)

![Loader cache with backend config](./loader-cache-with-backend-config.png)

![Loader cache with backend test 2 results](./loader-cache-with-backend-test-2-results.png)

![Loader cache with backend test 2 config](./loader-cache-with-backend-test-2-config.png)

- The results are a lot better, which supports earlier hypothesis.
- However, these results don't seem as good as running everything in one server, but will probably yield better results with horizontal scaling.

![Loader single-server no-split results](./loader-single-server-no-split-results.png)

![Loader single-server no-split config](./loader-single-server-no-split-config.png)

![Loader one-server results](./loader-one-server-results.png)

![Loader one-server config](./loader-one-server-config.png)

- Without the cache, the server runs a lot worse, the average time being upwards of two seconds.

![Loader split no-cache test 1 config](./loader-split-no-cache-test-1-config.png)

![Loader split no-cache test 2 config](./loader-split-no-cache-test-2-config.png)

![Loader split no-cache test 1 results](./loader-split-no-cache-test-1-results.png)

![Loader split no-cache test 2 results](./loader-split-no-cache-test-2-results.png)

## Additional Artifacts

![Postman submit question route working](./postman-submit-question-route-working.png)

![Test suite running](./test-suite-running.png)

![Test code coverage](./test-code-coverage.png)
