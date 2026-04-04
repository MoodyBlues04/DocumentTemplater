# DocumentTemplater

### Quick start
1. `git clone git@github.com:MoodyBlues04/DocumentTemplater.git`
2. `composer install`
3. `cp .env.example .env`
4. fill `.env` file with correct application name, db and mailer settings
5. `php artisan storage:link`
6. `php artisan migrate:fresh`
7. optional: seed db with `php artisan db:seed --class=DatabaseSeeder`
8. `php artisan serve`
