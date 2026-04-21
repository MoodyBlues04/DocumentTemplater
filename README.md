# DocumentTemplater

### Quick start
1. `git clone git@github.com:MoodyBlues04/DocumentTemplater.git`
2. `composer install`
3. `cp .env.example .env`
4. Fill `.env` file with correct application name, db and mailer settings
5. Link storages for correct file system work: `php artisan storage:link`
6. Run migrtions with: `php artisan migrate:fresh`
7. Seed db:
   - If you on dev use: `php artisan db:seed --class=DevDatabaseSeeder`. It will create user with credentials: `test@test.com` `password` and some test templates for him
   - If you on prod use `php artisan db:seed --class=ProdDatabaseSeeder`. It will set up fonts in DB
8. Run `php artisan serve` and `npm run dev` to start application

### Build in docker
1. `git clone git@github.com:MoodyBlues04/DocumentTemplater.git`
2. `cp .env.example .env`
3. Fill `.env` file with correct application name, db and mailer settings
4. ```docker build -f ./docker/8.2/Dockerfile.prod -t document_templater .``` to build image
5. ```docker compose -f docker-compose.dev.yml up``` to run docker container
6. ```
   docker exec <app_container_id> sh
   php artisan migrate
   php artisan db:seed --class=DevDatabaseSeeder
   ```
   to setup database
