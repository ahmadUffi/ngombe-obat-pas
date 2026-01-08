/**
 * Swagger Configuration for SmedBox API
 * This file contains the complete OpenAPI 3.0 specification
 */

export const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "SmedBox API",
    description:
      "API Documentation untuk SmedBox - Smart Medicine Box System. Sistem manajemen obat pintar dengan IoT integration, reminder WhatsApp, dan dose tracking.",
    version: "1.0.0",
    contact: {
      name: "SmedBox Support",
      email: "support@smedbox.com",
    },
    license: {
      name: "ISC",
    },
  },
  servers: [
    {
      url: "http://localhost:5000/v1/api",
      description: "Development server",
    },
    {
      url: "http://163.53.195.57:5000/v1/api",
      description: "Production server",
    },
  ],
  tags: [
    {
      name: "Authentication",
      description: "User authentication endpoints",
    },
    {
      name: "Profile",
      description: "User profile management",
    },
    {
      name: "Jadwal",
      description: "Medicine schedule management",
    },
    {
      name: "Dose Log",
      description: "Dose tracking and logging",
    },
    {
      name: "History",
      description: "Medicine intake history",
    },
    {
      name: "Kontrol",
      description: "Doctor appointment management",
    },
    {
      name: "Peringatan",
      description: "Alert and warning system",
    },
    {
      name: "Notes",
      description: "Personal notes management",
    },
    {
      name: "WhatsApp",
      description: "WhatsApp message integration",
    },
    {
      name: "Admin",
      description: "Admin-only operations",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT token obtained from login endpoint",
      },
    },
    responses: {
      UnauthorizedError: {
        description: "Access token is missing or invalid",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: {
                  type: "boolean",
                  example: false,
                },
                message: {
                  type: "string",
                  example: "Unauthorized - Token tidak valid",
                },
              },
            },
          },
        },
      },
      ForbiddenError: {
        description: "User does not have permission",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: {
                  type: "boolean",
                  example: false,
                },
                message: {
                  type: "string",
                  example: "Forbidden - Admin access required",
                },
              },
            },
          },
        },
      },
      NotFoundError: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: {
                  type: "boolean",
                  example: false,
                },
                message: {
                  type: "string",
                  example: "Resource tidak ditemukan",
                },
              },
            },
          },
        },
      },
      ValidationError: {
        description: "Validation failed",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: {
                  type: "boolean",
                  example: false,
                },
                message: {
                  type: "string",
                  example: "Validation error message",
                },
              },
            },
          },
        },
      },
      ServerError: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: {
                  type: "boolean",
                  example: false,
                },
                message: {
                  type: "string",
                  example: "Internal server error",
                },
                error: {
                  type: "string",
                  example: "Error details",
                },
              },
            },
          },
        },
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          message: {
            type: "string",
            example: "Error message",
          },
          error: {
            type: "string",
            example: "Detailed error information",
          },
        },
      },
      Success: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Operation successful",
          },
        },
      },
      Profile: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
          },
          user_id: {
            type: "string",
            format: "uuid",
          },
          username: {
            type: "string",
          },
          email: {
            type: "string",
            format: "email",
          },
          no_hp: {
            type: "string",
          },
        },
      },
      Jadwal: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
          },
          user_id: {
            type: "string",
            format: "uuid",
          },
          profile_id: {
            type: "string",
            format: "uuid",
          },
          nama_pasien: {
            type: "string",
          },
          nama_obat: {
            type: "string",
          },
          dosis_obat: {
            type: "integer",
          },
          jumlah_obat: {
            type: "integer",
          },
          catatan: {
            type: "string",
          },
          kategori: {
            type: "string",
          },
          slot_obat: {
            type: "string",
            enum: ["A", "B", "C", "D", "E", "F"],
          },
          jam_awal: {
            type: "array",
            items: {
              type: "string",
            },
          },
          jam_berakhir: {
            type: "array",
            items: {
              type: "string",
            },
          },
          created_at: {
            type: "string",
            format: "date-time",
          },
          updated_at: {
            type: "string",
            format: "date-time",
          },
        },
      },
    },
  },
  paths: {
    "/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login user",
        description: "Login dengan email dan password, mendapatkan JWT token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "user@example.com",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    example: "Password123!",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                      example: "Login berhasil",
                    },
                    data: {
                      type: "object",
                      properties: {
                        user: {
                          type: "object",
                          properties: {
                            id: {
                              type: "string",
                              format: "uuid",
                            },
                            email: {
                              type: "string",
                            },
                          },
                        },
                        session: {
                          type: "object",
                          properties: {
                            access_token: {
                              type: "string",
                            },
                            refresh_token: {
                              type: "string",
                            },
                            expires_in: {
                              type: "integer",
                            },
                            token_type: {
                              type: "string",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/forgot-password": {
      post: {
        tags: ["Authentication"],
        summary: "Send password reset email",
        description: "Kirim email untuk reset password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "user@example.com",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Email sent successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Success",
                },
              },
            },
          },
          404: {
            description: "Email not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/profile/me": {
      get: {
        tags: ["Profile"],
        summary: "Get current user profile",
        description: "Mendapatkan data profile user yang sedang login",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: "Profile retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      $ref: "#/components/schemas/Profile",
                    },
                  },
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          404: {
            $ref: "#/components/responses/NotFoundError",
          },
        },
      },
    },
    "/profile/update": {
      put: {
        tags: ["Profile"],
        summary: "Update user profile",
        description: "Update username, phone number, dan profile image",
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  username: {
                    type: "string",
                    example: "John Doe",
                  },
                  no_hp: {
                    type: "string",
                    example: "628123456789",
                  },
                  image: {
                    type: "string",
                    format: "binary",
                    description: "Profile image (max 5MB)",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Profile updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                      example: "Profile berhasil diupdate",
                    },
                    data: {
                      $ref: "#/components/schemas/Profile",
                    },
                  },
                },
              },
            },
          },
          400: {
            $ref: "#/components/responses/ValidationError",
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
    },
    "/jadwal/input": {
      post: {
        tags: ["Jadwal"],
        summary: "Create new jadwal",
        description: "Membuat jadwal minum obat baru",
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "nama_pasien",
                  "nama_obat",
                  "dosis_obat",
                  "jumlah_obat",
                  "jam_awal",
                  "jam_berakhir",
                  "slot_obat",
                ],
                properties: {
                  nama_pasien: {
                    type: "string",
                    example: "John Doe",
                  },
                  nama_obat: {
                    type: "string",
                    example: "Paracetamol",
                  },
                  dosis_obat: {
                    type: "integer",
                    example: 2,
                  },
                  jumlah_obat: {
                    type: "integer",
                    example: 30,
                  },
                  jam_awal: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                    example: ["07:00", "19:00"],
                  },
                  jam_berakhir: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                    example: ["07:30", "19:30"],
                  },
                  catatan: {
                    type: "string",
                    example: "Sesudah makan",
                  },
                  kategori: {
                    type: "string",
                    example: "Analgesik",
                  },
                  slot_obat: {
                    type: "string",
                    enum: ["A", "B", "C", "D", "E", "F"],
                    example: "A",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Jadwal created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Jadwal berhasil dibuat",
                    },
                  },
                },
              },
            },
          },
          400: {
            $ref: "#/components/responses/ValidationError",
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
    },
    "/jadwal/get-for-web": {
      get: {
        tags: ["Jadwal"],
        summary: "Get all jadwal for web",
        description:
          "Mendapatkan semua jadwal untuk tampilan web (data lengkap)",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: "Jadwal retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Jadwal",
                  },
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
    },
    "/jadwal/get-for-iot": {
      get: {
        tags: ["Jadwal"],
        summary: "Get jadwal for IoT device",
        description:
          "Mendapatkan jadwal untuk perangkat IoT (data minimal + nomor HP)",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: "Jadwal retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    no_hp: {
                      type: "string",
                      example: "628123456789",
                    },
                    jadwalMinum: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Jadwal",
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
    },
    "/jadwal/update-stock-obat-iot": {
      put: {
        tags: ["Jadwal"],
        summary: "Update stock from IoT",
        description:
          "Mengurangi stok obat ketika diambil dari perangkat IoT (tidak perlu auth)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["id_obat"],
                properties: {
                  id_obat: {
                    type: "string",
                    format: "uuid",
                    example: "550e8400-e29b-41d4-a716-446655440000",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Stock updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                      example: "Stock obat berhasil dikurangi",
                    },
                    id_jadwal: {
                      type: "string",
                      format: "uuid",
                    },
                    currentStock: {
                      type: "integer",
                      example: 29,
                    },
                  },
                },
              },
            },
          },
          500: {
            $ref: "#/components/responses/ServerError",
          },
        },
      },
    },
    "/jadwal/update-stock-obat-web": {
      put: {
        tags: ["Jadwal"],
        summary: "Update stock from web",
        description: "Update stok obat dari web (bisa tambah atau kurang)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["id_obat", "newStock"],
                properties: {
                  id_obat: {
                    type: "string",
                    format: "uuid",
                    example: "550e8400-e29b-41d4-a716-446655440000",
                  },
                  newStock: {
                    type: "integer",
                    example: 50,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Stock updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                      example: "Stock obat berhasil diupdate",
                    },
                    id_jadwal: {
                      type: "string",
                      format: "uuid",
                    },
                    currentStock: {
                      type: "integer",
                      example: 50,
                    },
                  },
                },
              },
            },
          },
          500: {
            $ref: "#/components/responses/ServerError",
          },
        },
      },
    },
    "/jadwal/delete/{jadwal_id}": {
      delete: {
        tags: ["Jadwal"],
        summary: "Delete jadwal",
        description: "Menghapus jadwal berdasarkan ID",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "jadwal_id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
            description: "UUID jadwal yang akan dihapus",
          },
        ],
        responses: {
          200: {
            description: "Jadwal deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                      example: "Jadwal berhasil dihapus",
                    },
                  },
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          500: {
            $ref: "#/components/responses/ServerError",
          },
        },
      },
    },
    "/dose-log/status-today": {
      get: {
        tags: ["Dose Log"],
        summary: "Get dose status today",
        description:
          "Mendapatkan status dosis hari ini (pending, taken, missed)",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: "Status retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          jadwal_id: {
                            type: "string",
                            format: "uuid",
                          },
                          user_id: {
                            type: "string",
                            format: "uuid",
                          },
                          nama_obat: {
                            type: "string",
                          },
                          nama_pasien: {
                            type: "string",
                          },
                          dose_time: {
                            type: "string",
                          },
                          status: {
                            type: "string",
                            enum: ["pending", "taken", "missed"],
                          },
                          taken_at: {
                            type: "string",
                            format: "date-time",
                            nullable: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
    },
    "/message/test/send": {
      post: {
        tags: ["WhatsApp"],
        summary: "Send WhatsApp message (Test/Dry-Run)",
        description:
          "Test kirim pesan WhatsApp dalam dry-run mode (tidak ada biaya)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["phone", "message"],
                properties: {
                  phone: {
                    type: "string",
                    example: "628123456789",
                  },
                  message: {
                    type: "string",
                    example: "Test pesan reminder minum obat",
                  },
                  type: {
                    type: "string",
                    enum: ["text"],
                    default: "text",
                  },
                  dryRun: {
                    type: "integer",
                    enum: [0, 1],
                    example: 1,
                    description: "1 = dry-run mode (no cost), 0 = production",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Message sent successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                      example: "Message sent successfully",
                    },
                    data: {
                      type: "object",
                      properties: {
                        messageId: {
                          type: "string",
                        },
                        phone: {
                          type: "string",
                        },
                        sentAt: {
                          type: "string",
                          format: "date-time",
                        },
                        type: {
                          type: "string",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            $ref: "#/components/responses/ValidationError",
          },
        },
      },
    },
    "/admin/cron/stock-check": {
      post: {
        tags: ["Admin"],
        summary: "Manual stock check cron",
        description:
          "Trigger manual cron job untuk cek stok obat dan kirim notifikasi (Admin only)",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: "Stock check completed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    result: {
                      type: "object",
                      properties: {
                        processedJadwal: {
                          type: "integer",
                        },
                        lowStockCount: {
                          type: "integer",
                        },
                        outOfStockCount: {
                          type: "integer",
                        },
                        notificationsSent: {
                          type: "integer",
                        },
                        errors: {
                          type: "array",
                          items: {
                            type: "string",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          403: {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
      },
    },
    "/jadwal/list": {
      get: {
        tags: ["Jadwal"],
        summary: "Get all jadwal for current user",
        description: "Mendapatkan list semua jadwal obat untuk user yang login",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: "List jadwal retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Jadwal",
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
    },
    "/jadwal/{jadwal_id}": {
      get: {
        tags: ["Jadwal"],
        summary: "Get specific jadwal by ID",
        description: "Mendapatkan detail jadwal berdasarkan jadwal_id",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "jadwal_id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
            description: "UUID of jadwal",
          },
        ],
        responses: {
          200: {
            description: "Jadwal retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      $ref: "#/components/schemas/Jadwal",
                    },
                  },
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          404: {
            $ref: "#/components/responses/NotFoundError",
          },
        },
      },
    },
    "/jadwal/update/{jadwal_id}": {
      put: {
        tags: ["Jadwal"],
        summary: "Update jadwal",
        description: "Update informasi jadwal obat",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "jadwal_id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  nama_obat: {
                    type: "string",
                  },
                  jumlah_obat: {
                    type: "integer",
                  },
                  waktu_minum: {
                    type: "array",
                    items: {
                      type: "string",
                      example: "08:00",
                    },
                  },
                  catatan: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Jadwal updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                      example: "Jadwal berhasil diupdate",
                    },
                  },
                },
              },
            },
          },
          400: {
            $ref: "#/components/responses/ValidationError",
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          404: {
            $ref: "#/components/responses/NotFoundError",
          },
        },
      },
    },
    "/dose-log/input": {
      post: {
        tags: ["Dose Log"],
        summary: "Log dose intake",
        description: "Catat konsumsi obat oleh user (dari IoT atau manual)",
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["jadwal_id", "waktu_minum"],
                properties: {
                  jadwal_id: {
                    type: "string",
                    format: "uuid",
                  },
                  waktu_minum: {
                    type: "string",
                    example: "08:00",
                  },
                  status: {
                    type: "string",
                    enum: ["taken", "skipped"],
                    default: "taken",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Dose log created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                      example: "Dose log berhasil dicatat",
                    },
                    data: {
                      $ref: "#/components/schemas/DoseLog",
                    },
                  },
                },
              },
            },
          },
          400: {
            $ref: "#/components/responses/ValidationError",
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
    },
    "/dose-log/history": {
      get: {
        tags: ["Dose Log"],
        summary: "Get dose log history",
        description: "Mendapatkan riwayat konsumsi obat user",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "start_date",
            in: "query",
            schema: {
              type: "string",
              format: "date",
            },
            description: "Filter from date (YYYY-MM-DD)",
          },
          {
            name: "end_date",
            in: "query",
            schema: {
              type: "string",
              format: "date",
            },
            description: "Filter to date (YYYY-MM-DD)",
          },
        ],
        responses: {
          200: {
            description: "Dose log history retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/DoseLog",
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
    },
    "/history": {
      get: {
        tags: ["History"],
        summary: "Get user history",
        description: "Mendapatkan riwayat aktivitas user",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: "History retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/History",
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
    },
    "/history/delete/{history_id}": {
      delete: {
        tags: ["History"],
        summary: "Delete history entry",
        description: "Hapus entry riwayat tertentu",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "history_id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],
        responses: {
          200: {
            description: "History deleted successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Success",
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          404: {
            $ref: "#/components/responses/NotFoundError",
          },
        },
      },
    },
    "/kontrol/input": {
      post: {
        tags: ["Kontrol"],
        summary: "Create kontrol schedule",
        description: "Buat jadwal kontrol ke dokter/fasilitas kesehatan",
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "nama_faskes",
                  "nama_dokter",
                  "tanggal_kontrol",
                  "waktu_kontrol",
                ],
                properties: {
                  nama_faskes: {
                    type: "string",
                    example: "RS Siloam",
                  },
                  nama_dokter: {
                    type: "string",
                    example: "Dr. John",
                  },
                  tanggal_kontrol: {
                    type: "string",
                    format: "date",
                    example: "2024-02-15",
                  },
                  waktu_kontrol: {
                    type: "string",
                    example: "10:00",
                  },
                  catatan: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Kontrol schedule created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                      example: "Jadwal kontrol berhasil dibuat",
                    },
                    data: {
                      $ref: "#/components/schemas/Kontrol",
                    },
                  },
                },
              },
            },
          },
          400: {
            $ref: "#/components/responses/ValidationError",
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
    },
    "/kontrol/list": {
      get: {
        tags: ["Kontrol"],
        summary: "Get kontrol schedules",
        description: "Mendapatkan list jadwal kontrol user",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: "Kontrol schedules retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Kontrol",
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
    },
    "/kontrol/update/{kontrol_id}": {
      put: {
        tags: ["Kontrol"],
        summary: "Update kontrol schedule",
        description: "Update jadwal kontrol",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "kontrol_id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  nama_faskes: {
                    type: "string",
                  },
                  nama_dokter: {
                    type: "string",
                  },
                  tanggal_kontrol: {
                    type: "string",
                    format: "date",
                  },
                  waktu_kontrol: {
                    type: "string",
                  },
                  catatan: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Kontrol updated successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Success",
                },
              },
            },
          },
          400: {
            $ref: "#/components/responses/ValidationError",
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          404: {
            $ref: "#/components/responses/NotFoundError",
          },
        },
      },
    },
    "/kontrol/delete/{kontrol_id}": {
      delete: {
        tags: ["Kontrol"],
        summary: "Delete kontrol schedule",
        description: "Hapus jadwal kontrol",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "kontrol_id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],
        responses: {
          200: {
            description: "Kontrol deleted successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Success",
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          404: {
            $ref: "#/components/responses/NotFoundError",
          },
        },
      },
    },
    "/peringatan": {
      get: {
        tags: ["Peringatan"],
        summary: "Get all peringatan",
        description: "Mendapatkan list semua peringatan untuk user",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: "Peringatan retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Peringatan",
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
    },
    "/peringatan/{id}": {
      get: {
        tags: ["Peringatan"],
        summary: "Get specific peringatan",
        description: "Mendapatkan detail peringatan berdasarkan ID",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],
        responses: {
          200: {
            description: "Peringatan retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      $ref: "#/components/schemas/Peringatan",
                    },
                  },
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          404: {
            $ref: "#/components/responses/NotFoundError",
          },
        },
      },
    },
    "/peringatan/mark-read/{id}": {
      put: {
        tags: ["Peringatan"],
        summary: "Mark peringatan as read",
        description: "Tandai peringatan sebagai sudah dibaca",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],
        responses: {
          200: {
            description: "Peringatan marked as read",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Success",
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          404: {
            $ref: "#/components/responses/NotFoundError",
          },
        },
      },
    },
    "/peringatan/delete/{id}": {
      delete: {
        tags: ["Peringatan"],
        summary: "Delete peringatan",
        description: "Hapus peringatan",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],
        responses: {
          200: {
            description: "Peringatan deleted successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Success",
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          404: {
            $ref: "#/components/responses/NotFoundError",
          },
        },
      },
    },
    "/notes": {
      get: {
        tags: ["Notes"],
        summary: "Get all notes",
        description: "Mendapatkan semua catatan user",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: "Notes retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Note",
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
      post: {
        tags: ["Notes"],
        summary: "Create note",
        description: "Buat catatan baru",
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "content"],
                properties: {
                  title: {
                    type: "string",
                    example: "Catatan Dokter",
                  },
                  content: {
                    type: "string",
                    example: "Jangan lupa minum obat setelah makan",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Note created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                      example: "Note berhasil dibuat",
                    },
                    data: {
                      $ref: "#/components/schemas/Note",
                    },
                  },
                },
              },
            },
          },
          400: {
            $ref: "#/components/responses/ValidationError",
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
    },
    "/notes/{id}": {
      put: {
        tags: ["Notes"],
        summary: "Update note",
        description: "Update catatan",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                  },
                  content: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Note updated successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Success",
                },
              },
            },
          },
          400: {
            $ref: "#/components/responses/ValidationError",
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          404: {
            $ref: "#/components/responses/NotFoundError",
          },
        },
      },
      delete: {
        tags: ["Notes"],
        summary: "Delete note",
        description: "Hapus catatan",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],
        responses: {
          200: {
            description: "Note deleted successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Success",
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          404: {
            $ref: "#/components/responses/NotFoundError",
          },
        },
      },
    },
    "/message/test/dry-run": {
      post: {
        tags: ["WhatsApp"],
        summary: "Test WhatsApp connection (dry run)",
        description:
          "Test koneksi ke Wablas tanpa mengirim pesan (hanya cek status)",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: "Connection test successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                      example:
                        "Koneksi WhatsApp berhasil - Tidak ada pesan dikirim (dry-run)",
                    },
                    wablas_status: {
                      type: "object",
                    },
                  },
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          500: {
            $ref: "#/components/responses/ServerError",
          },
        },
      },
    },
    "/admin/cron/control-reminders": {
      post: {
        tags: ["Admin"],
        summary: "Trigger control reminders cron job",
        description:
          "Manually trigger cron job untuk mengirim reminder jadwal kontrol",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: "Control reminders sent successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                    },
                    result: {
                      type: "object",
                      properties: {
                        totalChecked: {
                          type: "integer",
                        },
                        remindersSent: {
                          type: "integer",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          403: {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
      },
    },
  },
};
