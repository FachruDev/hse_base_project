#!/usr/bin/env sh
set -e

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

if [ "${WAIT_FOR_DB:-true}" = "true" ] && [ "${DB_CONNECTION:-}" != "sqlite" ]; then
    php -r '
        $connection = getenv("DB_CONNECTION") ?: "mysql";
        $driver = match ($connection) {
            "pgsql" => "pgsql",
            "sqlsrv" => "sqlsrv",
            default => "mysql",
        };
        $host = getenv("DB_HOST") ?: "127.0.0.1";
        $port = getenv("DB_PORT") ?: match ($driver) {
            "pgsql" => "5432",
            "sqlsrv" => "1433",
            default => "3306",
        };
        $database = getenv("DB_DATABASE") ?: "laravel";
        $username = getenv("DB_USERNAME") ?: "root";
        $password = getenv("DB_PASSWORD") ?: "";
        $trustServerCertificate = filter_var(getenv("DB_TRUST_SERVER_CERTIFICATE") ?: "true", FILTER_VALIDATE_BOOLEAN);
        $encrypt = filter_var(getenv("DB_ENCRYPT") ?: "false", FILTER_VALIDATE_BOOLEAN);

        $buildDsn = static function (string $targetDatabase) use ($driver, $host, $port, $trustServerCertificate, $encrypt): string {
            return match ($driver) {
                "pgsql" => "pgsql:host={$host};port={$port};dbname={$targetDatabase}",
                "sqlsrv" => sprintf(
                    "sqlsrv:Server=%s,%s;Database=%s;Encrypt=%s;TrustServerCertificate=%s",
                    $host,
                    $port,
                    $targetDatabase,
                    $encrypt ? "yes" : "no",
                    $trustServerCertificate ? "yes" : "no",
                ),
                default => "mysql:host={$host};port={$port};dbname={$targetDatabase}",
            };
        };

        for ($attempt = 1; $attempt <= 60; $attempt++) {
            try {
                if ($driver === "sqlsrv") {
                    $master = new PDO($buildDsn("master"), $username, $password);
                    $quote = chr(39);
                    $databaseLiteral = str_replace($quote, $quote.$quote, $database);
                    $databaseIdentifier = str_replace("]", "]]", $database);
                    $master->exec("IF DB_ID(N".$quote.$databaseLiteral.$quote.") IS NULL CREATE DATABASE [{$databaseIdentifier}]");
                }

                new PDO($buildDsn($database), $username, $password);
                exit(0);
            } catch (Throwable $exception) {
                fwrite(STDERR, "Waiting for database ({$attempt}/60)...\n");
                sleep(2);
            }
        }

        fwrite(STDERR, "Database is not reachable.\n");
        exit(1);
    '
fi

if [ "${RUN_STORAGE_LINK:-true}" = "true" ]; then
    php artisan storage:link || true
fi

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    php artisan migrate --force
fi

if [ "${RUN_SEEDERS:-false}" = "true" ]; then
    php artisan db:seed --force
fi

if [ "${RUN_OPTIMIZE:-true}" = "true" ]; then
    php artisan optimize
else
    php artisan optimize:clear
fi

exec "$@"
