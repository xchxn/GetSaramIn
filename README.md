# WSD Crawler

Web scraping and data crawling service built with NestJS for collecting job postings and company information.

## Features

- Job posting crawling and management
- Company information collection
- Authentication system
- Bookmarking functionality
- Community features
- Event management
- Application tracking

## Tech Stack

- **Framework**: NestJS
- **Database**: MySQL with TypeORM
- **Authentication**: Passport.js, JWT
- **Web Scraping**: Puppeteer, Cheerio
- **Caching**: Redis
- **WebSocket**: Socket.io
- **API Documentation**: Swagger

## Project Structure

```
src/
├── modules/
│   ├── apply/        # Job application handling
│   ├── auth/         # Authentication & authorization
│   ├── bookmarks/    # User bookmarks functionality
│   ├── community/    # Community features
│   ├── company/      # Company information management
│   ├── event/        # Event handling
│   └── jobs/         # Job posting management
```

## Getting Started

### Prerequisites

- Node.js
- MySQL
- Redis

### Installation

1. Clone the repository
```bash
git clone [repository-url]
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env` file in the root directory with the following variables:
```env
DEFAULT_REQUEST_URL=[base-url-for-crawling]
CARRER_REQUEST_URL=[base-url-for-other-crawling]
DATABASE_HOST=
DATABASE_PORT=
DATABASE_USERNAME=
DATABASE_PASSWORD=
DATABASE_NAME=
REDIS_HOST=
REDIS_PORT=
JWT_SECRET=
```

4. Run the application
```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## API Documentation

The API documentation is available via Swagger UI at `/api` endpoint when running the application.

## Features by Module

### Jobs Module
- Web crawling for job postings
- Job listing management
- Search and filtering capabilities

### Company Module
- Company information crawling
- Company profile management
- Company data storage and retrieval

### Auth Module
- User authentication
- JWT token management
- Role-based access control

### Bookmarks Module
- Save favorite job postings
- Manage bookmarked items
- User-specific collections

### Community Module
- User interaction features
- Content sharing
- Discussion management

### Event Module
- Event tracking
- Event notifications
- Event management

### Apply Module
- Job application tracking
- Application status management
- Application history

## Scripts

- `npm run build`: Build the application
- `npm run format`: Format code using Prettier
- `npm run start`: Start the application
- `npm run start:dev`: Start in development mode
- `npm run start:debug`: Start in debug mode
- `npm run lint`: Lint and fix code
- `npm run test`: Run tests
- `npm test:e2e`: Run end-to-end tests

## License

MIT - see the LICENSE file for details