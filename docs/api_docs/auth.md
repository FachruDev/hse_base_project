# Auth API

## POST /auth/login

Login mobile memakai `login` dan `password`. Field `login` boleh berisi `user_id`/`external_id` atau email.

Default awal rollout untuk user lama dan user seeder adalah `Gpl12345!`. Setelah itu admin dapat mengganti password dari halaman Management User.

Request:

```json
{
  "login": "irvan.m",
  "password": "Gpl12345!",
  "device_name": "flutter-android"
}
```

Response 200:

```json
{
  "message": "Login berhasil.",
  "data": {
    "token_type": "Bearer",
    "access_token": "plain-token-hanya-muncul-sekali",
    "expires_at": null,
    "user": {
      "id": 1,
      "user_id": "irvan.m",
      "email": "irvan.m@galenium.local",
      "name": "Irvan Maulana",
      "department": {
        "id": 1,
        "name": "Produksi Pharma"
      },
      "roles": ["operator"],
      "permissions": ["ipal.logs.create"]
    }
  }
}
```

Response 401 jika login/password salah, password belum diset, atau user tidak aktif:

```json
{
  "message": "Login atau password tidak sesuai, atau user tidak aktif."
}
```

## GET /auth/me

Header:

```http
Authorization: Bearer {access_token}
```

Response 200:

```json
{
  "data": {
    "user": {
      "id": 1,
      "user_id": "irvan.m",
      "email": "irvan.m@galenium.local",
      "name": "Irvan Maulana",
      "department": {
        "id": 1,
        "name": "Produksi Pharma"
      },
      "roles": [],
      "permissions": []
    }
  }
}
```

## POST /auth/logout

Menghapus token yang sedang dipakai.

Header:

```http
Authorization: Bearer {access_token}
```

Response 200:

```json
{
  "message": "Logout berhasil."
}
```

Setelah logout, token lama akan menghasilkan 401.
