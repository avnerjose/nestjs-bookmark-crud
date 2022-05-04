<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

## ⚡️ The Project
  This is NestJS API with simple JWT authentication and bookmark CRUD.

## 🎯 Features
 - JWT sign up and sign in
 - Bookmark CRUD
 - Relational Database connection
 - e2e tests


## ⚙️ Dependencies
 - [Yarn](https://yarnpkg.com/)
 - [Docker Compose](https://docs.docker.com/compose/)

## 🚀️ Getting Started

1. Clone this repository: 

```bash
git clone https://github.com/avnerjose/nodejs-ignite-solid.git
```
2. Go to the folder you cloned the repository and install all dependencies

```bash
cd nodejs-message.io-backend && yarn
```

## Running the app

1. Create .env and .env.test files with "DATABASE_URL", which should be and Postgres connection URL and JWT_SECRET that should be a random hash
   
2. Run database container
```bash
docker-compose up
```
3. Run migrations
```bash
yarn prisma migrate dev
```
4. Run the server
```bash
yarn start:dev
```
5. Make request to [localhost:3333]('http://localhost:3333') to test the api
   

## Test

```bash
yarn test:e2e
```
