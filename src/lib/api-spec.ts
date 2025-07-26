/**
 * OpenAPI 3.0 Specification for Customer Support AI Agent API
 * This defines the contract between frontend and backend
 */

export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Customer Support AI Agent API",
    version: "1.0.0",
    description: "API for managing customer support operations, AI interactions, and administrative functions",
    contact: {
      name: "Support Team",
      email: "support@company.com"
    }
  },
  servers: [
    {
      url: "/api/v1",
      description: "Production API"
    },
    {
      url: "/api/mock",
      description: "Mock API for development"
    }
  ],
  paths: {
    "/chats": {
      get: {
        summary: "Get chat conversations",
        operationId: "getChats",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 }
          },
          {
            name: "limit",
            in: "query", 
            schema: { type: "integer", default: 10, maximum: 100 }
          },
          {
            name: "status",
            in: "query",
            schema: { 
              type: "string",
              enum: ["active", "resolved", "pending"]
            }
          }
        ],
        responses: {
          "200": {
            description: "List of chat conversations",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Chat" }
                    },
                    pagination: { $ref: "#/components/schemas/Pagination" }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: "Create new chat conversation",
        operationId: "createChat",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateChatRequest" }
            }
          }
        },
        responses: {
          "201": {
            description: "Chat created successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Chat" }
              }
            }
          }
        }
      }
    },
    "/chats/{chatId}": {
      get: {
        summary: "Get chat by ID",
        operationId: "getChatById",
        parameters: [
          {
            name: "chatId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Chat details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Chat" }
              }
            }
          },
          "404": {
            description: "Chat not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    },
    "/users": {
      get: {
        summary: "Get users",
        operationId: "getUsers",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 }
          },
          {
            name: "limit", 
            in: "query",
            schema: { type: "integer", default: 10 }
          }
        ],
        responses: {
          "200": {
            description: "List of users",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/User" }
                    },
                    pagination: { $ref: "#/components/schemas/Pagination" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/organizations": {
      get: {
        summary: "Get organizations",
        operationId: "getOrganizations",
        responses: {
          "200": {
            description: "List of organizations",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Organization" }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Chat: {
        type: "object",
        required: ["id", "customerId", "status", "createdAt"],
        properties: {
          id: { type: "string", example: "chat_001" },
          customerId: { type: "string", example: "user_001" },
          customerName: { type: "string", example: "John Doe" },
          customerEmail: { type: "string", example: "john@example.com" },
          subject: { type: "string", example: "Billing inquiry" },
          status: { 
            type: "string", 
            enum: ["active", "resolved", "pending"],
            example: "active" 
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high", "urgent"],
            example: "medium"
          },
          assignedAgent: { type: "string", example: "agent_001" },
          lastMessage: { type: "string", example: "How can I help you today?" },
          messageCount: { type: "integer", example: 5 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      User: {
        type: "object",
        required: ["id", "name", "email", "role"],
        properties: {
          id: { type: "string", example: "user_001" },
          name: { type: "string", example: "John Doe" },
          email: { type: "string", example: "john@example.com" },
          role: { 
            type: "string", 
            enum: ["admin", "agent", "supervisor"],
            example: "agent" 
          },
          status: {
            type: "string",
            enum: ["active", "inactive", "pending"],
            example: "active"
          },
          organizationId: { type: "string", example: "org_001" },
          lastLoginAt: { type: "string", format: "date-time" },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      Organization: {
        type: "object",
        required: ["id", "name", "plan"],
        properties: {
          id: { type: "string", example: "org_001" },
          name: { type: "string", example: "Acme Corp" },
          plan: {
            type: "string",
            enum: ["starter", "professional", "enterprise"],
            example: "professional"
          },
          userCount: { type: "integer", example: 25 },
          chatCount: { type: "integer", example: 1250 },
          status: {
            type: "string", 
            enum: ["active", "suspended", "trial"],
            example: "active"
          },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      CreateChatRequest: {
        type: "object",
        required: ["customerId", "subject"],
        properties: {
          customerId: { type: "string" },
          subject: { type: "string" },
          priority: {
            type: "string",
            enum: ["low", "medium", "high", "urgent"],
            default: "medium"
          }
        }
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          total: { type: "integer", example: 100 },
          totalPages: { type: "integer", example: 10 }
        }
      },
      Error: {
        type: "object",
        required: ["message"],
        properties: {
          message: { type: "string" },
          code: { type: "string" },
          details: { type: "object" }
        }
      }
    }
  }
} as const;

export type ApiPaths = typeof openApiSpec.paths;
export type ApiComponents = typeof openApiSpec.components;