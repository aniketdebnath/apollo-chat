# <img src="apollochat-ui/public/logo512.png" width="40" align="center" alt="Apollo Chat Logo"> Apollo Chat

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-9-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![GraphQL](https://img.shields.io/badge/GraphQL-16-E10098?logo=graphql&logoColor=white)](https://graphql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Apollo](https://img.shields.io/badge/Apollo-Client_&_Server-311C87?logo=apollo-graphql&logoColor=white)](https://www.apollographql.com/)
[![AWS](https://img.shields.io/badge/AWS-Cloud_Services-FF9900?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![Material UI](https://img.shields.io/badge/Material_UI-5-0081CB?logo=mui&logoColor=white)](https://mui.com/)

**A modern real-time chat platform built with React, NestJS, GraphQL, and MongoDB**

[✨ Features](#-features) • [🏗️ Architecture](#️-architecture) • [🛠️ Tech Stack](#️-tech-stack) • [📚 Documentation](#-documentation) • [🔗 Live Demo](https://apollo-chat.aniketdebnath.com)

</div>

## 🌟 Overview

Apollo Chat is a full-featured real-time messaging platform that demonstrates modern web development practices. Built with a React frontend and NestJS backend, it leverages GraphQL for efficient data operations and WebSocket subscriptions for real-time updates.

### Key Highlights

- **GraphQL-powered Real-time Communication** with filtered subscription channels and optimized payload delivery
- **Multi-tier Chat Visibility Model** with role-based access control and pinning capabilities
- **WebSocket-driven Presence System** with connection-aware status transitions and live indicators
- **Token-based Authentication Architecture** with refresh rotation and multi-strategy support
- **MongoDB Aggregation Pipelines** for efficient data retrieval with embedded latest messages
- **S3-integrated Media Management** for profile images with secure upload workflows
- **Interactive Onboarding Experience** with guided welcome tour and contextual user interface
- **Subscription Lifecycle Management** with dependency-aware cleanup and race condition prevention
- **Secure Demo Environment** with read-only access and specialized interceptors

<details>
<summary><b>📸 Screenshots</b></summary>
<br>

Screenshots of the application's key features are available in the detailed documentation. See the [Features](docs/frontend/features.md) section for visual examples of the user interface.

</details>

## ✨ Features

<table>
  <tr>
    <td width="50%">
      <h3>💬 Real-time Messaging</h3>
      <ul>
        <li>Instant message delivery via Graphql subscriptions</li>
        <li>Message history with pagination</li>
        <li>Optimistic UI updates with Apollo cache integration</li>
        <li>Chat-isolated PubSub channels with member filtering</li>
      </ul>
    </td>
    <td width="50%">
      <h3>👥 Chat Management</h3>
      <ul>
        <li>Create private or public chats</li>
        <li>Add/remove members and moderate chats with ban system</li>
        <li>Pin important conversations</li>
        <li>Discover and join public chats</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>👤 User Profiles</h3>
      <ul>
        <li>Custom profile pictures</li>
        <li>Connection-aware WebSocket live status indicators</li>
        <li>User search functionality</li>
        <li>Multi-state status management (online/away/busy/offline)</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🔒 Security Features</h3>
      <ul>
        <li>JWT with HTTP-only cookie rotation protocol</li>
        <li>Multi-strategy authentication (Local/OAuth/JWT)</li>
        <li>Time-limited OTP verification with throttling</li>
        <li>Session tracking with cross-device token revocation</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🎨 UI Features</h3>
      <ul>
        <li>Mobile-first responsive design across devices</li>
        <li>Optimistic UI updates with Apollo cache integration</li>
        <li>Subscription reference tracking with automatic cleanup</li>
        <li>Structured cache operations with pagination merging</li>
      </ul>
    </td>
    <td width="50%">
      <h3>📱 Mobile Experience</h3>
      <ul>
        <li>Touch-optimized drawer interface</li>
        <li>Compact menus for small screens</li>
        <li>Bottom navigation for common actions</li>
        <li>Smart scroll management with position preservation</li>
      </ul>
    </td>
  </tr>
</table>

## 🏗️ Architecture

Apollo Chat follows a modern, layered architecture with clear separation of concerns:

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile App]
    end

    subgraph "API Layer"
        REST[REST Controllers]
        GraphQL[GraphQL Resolvers]
        WebSockets[WebSocket Gateway]
        Guards[Authentication Guards]
        Interceptors[Interceptors]
    end

    subgraph "Business Logic Layer"
        Services[Domain Services]
        PubSub[PubSub System]
        Validation[Input Validation]
    end

    subgraph "Data Access Layer"
        Repositories[Repositories]
        Entities[Entity Models]
        Migration[Database Migration]
    end

    subgraph "External Services"
        Database[(MongoDB)]
        Redis[(Redis)]
        S3[AWS S3]
        SMTP[Email Server]
        OAuth[OAuth Providers]
    end

    Browser --> REST
    Browser --> GraphQL
    Browser --> WebSockets
    Mobile --> REST
    Mobile --> GraphQL
    Mobile --> WebSockets

    REST --> Guards
    GraphQL --> Guards
    WebSockets --> Guards

    Guards --> Interceptors
    Interceptors --> Services

    Services --> Validation
    Services --> PubSub

    Services --> Repositories
    Repositories --> Entities
    Entities --> Migration

    Repositories --> Database
    PubSub --> Redis
    Services --> S3
    Services --> SMTP
    Services --> OAuth

    classDef clientLayer fill:#D4E6F1,stroke:#2874A6,stroke-width:1px,color:#000;
    classDef apiLayer fill:#D5F5E3,stroke:#1E8449,stroke-width:1px,color:#000;
    classDef businessLayer fill:#FCF3CF,stroke:#B7950B,stroke-width:1px,color:#000;
    classDef dataLayer fill:#F5CBA7,stroke:#A04000,stroke-width:1px,color:#000;
    classDef externalLayer fill:#D2B4DE,stroke:#6C3483,stroke-width:1px,color:#000;

    class Browser,Mobile clientLayer;
    class REST,GraphQL,WebSockets,Guards,Interceptors apiLayer;
    class Services,PubSub,Validation businessLayer;
    class Repositories,Entities,Migration dataLayer;
    class Database,Redis,S3,SMTP,OAuth externalLayer;
```

### Backend Architecture

The backend follows NestJS module architecture with GraphQL, REST, and WebSocket support:

```mermaid
graph TB
    Client[Client Applications] -->|HTTP/WS| API[API Gateway]

    API -->|REST| REST[REST Controllers]
    API -->|GraphQL| GQL[GraphQL Resolvers]
    API -->|WebSockets| WS[WebSocket Gateway]

    REST --> Auth[Auth Service]
    REST --> UserC[Users Controller]
    REST --> ChatC[Chats Controller]
    REST --> MsgC[Messages Controller]

    GQL --> UserR[Users Resolver]
    GQL --> ChatR[Chats Resolver]
    GQL --> MsgR[Messages Resolver]
    GQL --> SubR[Subscription Resolvers]

    UserC --> UserS[Users Service]
    UserR --> UserS

    ChatC --> ChatS[Chats Service]
    ChatR --> ChatS

    MsgC --> MsgS[Messages Service]
    MsgR --> MsgS

    SubR --> PS[PubSub System]

    UserS --> UR[Users Repository]
    ChatS --> CR[Chats Repository]
    MsgS --> CR

    UR --> DB[(MongoDB)]
    CR --> DB

    PS -->|Dev| Memory[In-Memory]
    PS -->|Prod| Redis[(Redis)]

    classDef gateway fill:#D4E6F1,stroke:#2874A6,stroke-width:1px,color:#000;
    classDef controllers fill:#D5F5E3,stroke:#1E8449,stroke-width:1px,color:#000;
    classDef services fill:#FCF3CF,stroke:#B7950B,stroke-width:1px,color:#000;
    classDef repositories fill:#F5CBA7,stroke:#A04000,stroke-width:1px,color:#000;
    classDef database fill:#D2B4DE,stroke:#6C3483,stroke-width:1px,color:#000;

    class Client,API gateway;
    class REST,GQL,WS,UserC,ChatC,MsgC,UserR,ChatR,MsgR,SubR controllers;
    class Auth,UserS,ChatS,MsgS,PS services;
    class UR,CR repositories;
    class DB,Memory,Redis database;
```

### Frontend Architecture

The frontend uses Apollo Client for state management and GraphQL operations:

```mermaid
graph TD
    Client[Browser Client] -->|HTTP/WS| ApolloClient[Apollo Client]
    ApolloClient -->|GraphQL| API[Backend API]
    ApolloClient -->|REST| API

    ApolloClient --> Cache[Apollo Cache]
    ApolloClient --> ReactiveVars[Reactive Variables]

    ApolloClient --> ReactComponents[React Components]
    ReactComponents --> Pages[Pages]
    ReactComponents --> SharedComponents[Shared Components]

    Pages --> Auth[Auth Pages]
    Pages --> Chat[Chat Interface]
    Pages --> Profile[Profile]
    Pages --> Explore[Explore]

    SharedComponents --> Header[Header]
    SharedComponents --> StatusIndicator[Status Indicator]
    SharedComponents --> ErrorBoundary[Error Boundary]

    Cache --> UIComponents[UI Components]

    classDef client fill:#D4E6F1,stroke:#2874A6,stroke-width:1px,color:#000;
    classDef apollo fill:#D5F5E3,stroke:#1E8449,stroke-width:1px,color:#000;
    classDef api fill:#FCF3CF,stroke:#B7950B,stroke-width:1px,color:#000;
    classDef components fill:#F5CBA7,stroke:#A04000,stroke-width:1px,color:#000;
    classDef pages fill:#D2B4DE,stroke:#6C3483,stroke-width:1px,color:#000;

    class Client client;
    class ApolloClient,Cache,ReactiveVars apollo;
    class API api;
    class ReactComponents,SharedComponents,UIComponents,Header,StatusIndicator,ErrorBoundary components;
    class Pages,Auth,Chat,Profile,Explore pages;
```

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **State Management**: Apollo Client
- **UI Components**: Material UI 5
- **Routing**: React Router 7
- **Real-time**: GraphQL Subscriptions (graphql-ws)
- **Type Generation**: GraphQL Code Generator
- **Utilities**: date-fns, Framer Motion

### Backend

- **Framework**: NestJS with TypeScript
- **API**: GraphQL (Apollo Server 4), REST (Express)
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: GraphQL Subscriptions with PubSub
- **Authentication**: JWT, Google OAuth 2.0, OTP Verification
- **File Storage**: AWS S3
- **Email**: Nodemailer with SMTP
- **Validation**: class-validator, GraphQL input types
- **Rate Limiting**: NestJS Throttler

### DevOps & CI/CD

- **CI/CD**: GitHub Actions with staging/production workflows
- **Secrets Management**: GitHub Encrypted Secrets
- **Monitoring**: AWS CloudWatch (planned)
- **Logs**: Pino Logger
- **Monitoring (planned)**: AWS CloudWatch or third-party services like Sentry
- **Build System**: Zip deployment packages (Elastic Beanstalk), Amplify build pipelines (frontend)

### Cloud Infrastructure

- **Frontend Hosting**: AWS Amplify
- **Backend Hosting**: AWS Elastic Beanstalk
- **Cache Layer**: Redis OSS on AWS ElastiCache
- **Storage**: AWS S3 (file uploads, profile pictures)
- **CDN**: AWS CloudFront for assets and media
- **DNS Management**: Custom domain managed via GoDaddy using CNAME records
- **Email Services**: Mailgun

### Testing & Documentation

- **Testing**: Jest (unit, integration) and Supertest (e2e), httpyac-endpoints
- **Documentation**: Compodoc (NestJS), Markdown-based frontend docs

## 🔐 Security

Apollo Chat implements a sophisticated zero-trust security architecture with defense-in-depth principles:

### Authentication Mechanisms

- **JWT-based Token Authentication**: Stateless cryptographic tokens with HTTP-only cookie storage
- **Multi-protocol Identity Verification**: OAuth 2.0 integration, credential-based authentication, and OTP verification
- **Token Rotation Protocol**: Secure refresh token mechanism with configurable expiration policies
- **Session Management**: Multi-device login support with cross-device revocation capabilities

### Protection Layer

- **Tiered Rate Limiting**: Endpoint-specific request throttling with customized limits (1/min for OTP, 5/min for verification)
- **Multi-layer Input Validation**: Context-aware sanitization with XSS/injection prevention
- **Access Control**: Role-based permissions with creator/member-specific operations
- **Network Layer Security**: Strict CORS policy with proxy-aware request handling

### Client-Server Security

- **Reactive Authentication State**: Non-persistent token management with automatic refresh mechanism
- **Secure Cookie Implementation**: HTTP-only, SameSite=strict, and Secure flag enforcement
- **Cryptographic Password Storage**: Bcrypt hashing with environment-specific configuration

For comprehensive security implementation details, see the [Security Documentation](docs/infra/security.md) and [Authentication Documentation](docs/core/authentication.md).

## 📚 Documentation

Comprehensive documentation is available in the `docs` directory:

- **Backend**

  - [Architecture](docs/backend/architecture.md)
  - [API Architecture](docs/backend/api-architecture.md)
  - [API Reference](docs/backend/api-reference.md)
  - [Database](docs/backend/database.md)
  - [PubSub System](docs/backend/pubsub.md)

- **Frontend**

  - [Architecture](docs/frontend/architecture.md)
  - [Caching](docs/frontend/caching.md)
  - [Features](docs/frontend/features.md)
  - [Hooks](docs/frontend/hooks.md)
  - [Lifecycle & Effects](docs/frontend/lifecycle-and-effect.md)

- **Core Modules**

  - [Authentication](docs/core/authentication.md)
  - [Users](docs/core/users.md)
  - [Chats](docs/core/chats.md)
  - [Messages](docs/core/messages.md)

- **Infrastructure**
  - [Deployment](docs/infra/deployment.md)
  - [Security](docs/infra/security.md)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [NestJS](https://nestjs.com/) - The progressive Node.js framework
- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [Apollo GraphQL](https://www.apollographql.com/) - The GraphQL implementation
- [MongoDB](https://www.mongodb.com/) - The database for modern applications
- [Material UI](https://mui.com/) - React components for faster and easier web development
