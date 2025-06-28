# DevCircle Project

DevCircle is a microservice-based social platform built with Node.js, Express, MongoDB, Redis, and RabbitMQ. The platform allows users to register, create posts, like, comment, share posts, follow each other, and receive notifications.

---

## 📍 Architecture

DevCircle is built using a **microservice architecture**, where each service runs independently but communicates using **RabbitMQ** for sending events and **Redis** for caching.

### Services:
| Service Name      | Description |
|-------------------|-------------|
| `auth-service`    | Handles user registration, login, and profile editing |
| `post-service`    | Handles creating, editing, deleting, liking, sharing posts |
| `comment-service` | Handles commenting on posts and mentioning users |
| `notification-service` | Sends notifications via database and email |
| `follow-service`  | Manages follow/unfollow logic and mutual follower checks |
| `search-service`  | Supports full-text search on posts (optional) |

---

## 📍 API Endpoints (Examples)

| Service   | Method | Endpoint                              | Description                    |
|-----------|--------|----------------------------------------|--------------------------------|
| Auth      | POST   | `/api/auth/register`                  | Register new user              |
| Post      | POST   | `/api/posts`                          | Create a post                  |
| Comment   | POST   | `/api/comments`                       | Create a comment with @mention |
| Follow    | POST   | `/api/follow`                         | Follow a user                  |
| Like      | POST   | `/api/likes`                          | Like/unlike a post             |
| Notify    | GET    | `/api/notifications/:userId`          | Get user notifications         |

---

## Technologies Used

- **Node.js + Express** – Server framework
- **MongoDB** – Primary database
- **Redis** – Caching user/post/comment data
- **RabbitMQ** – For service-to-service communication (events and RPC)
- **JWT** – User authentication
- **Nodemailer** – Sending emails
- **Rate Limiters** – To protect sensitive endpoints

---

## ⚙️ Key Features

### 📍 Auth Service
- Register/Login with JWT
- Store user details
- RPC responder for getting user info (`user.getInfo`)
- Redis caching of user data

### 📍 Post Service
- Create, edit, delete posts
- Like or unlike a post
- Share a post
- Tracks comments and likes in post schema
- Responds to RPC for `post.getOwner`

### 📍 Comment Service
- Add a comment to a post
- Detects and emits events when users are **mentioned** (e.g., `@chioma`)
- Publishes events like `comment.created` and `user.mentioned`
- Uses Redis for comment caching

### 📍 Notification Service
- Listens to events like:
  - `notification.mention`
  - `post.like.notification`
  - `comment.created.notification`
  - `user.followed`
- Stores notification in DB
- Sends email to user using `nodemailer`
- Caches user data using Redis (if not found, fetches via RPC)

### 👥 Follow Service
- Follow/Unfollow users
- Get followers/following count
- Check if a user is following another
- Get mutual followers
- Publishes `user.followed` event for notifications

---

## 📍 Event Communication (RabbitMQ)

- **Events (Fire-and-forget)**: 
  - `user.mentioned` → triggers notification
  - `comment.created` → used to update post or send notification
  - `post.liked` → triggers like notification
  - `user.followed` → triggers follow notification

- **RPC (Request-Response)**:
  - `user.getInfo` → called by other services to get user details
  - `post.getOwner` → used to notify post owner of a comment or like

---

## 📍 Redis Caching

We cache:
- User data (`user:{userId}`)
- Post data (`post:{postId}`)
- Comment data (`comment:{commentId}`)
- Follow counts (`follow:count:{userId}`)

This speeds up read-heavy operations and reduces MongoDB load.

---

## 📍 Email Notifications

Email is sent via the `notification-service` using **Nodemailer**. Users get notified by email when:
- They are mentioned in a comment
- Their post is liked
- Someone follows them

---

## How to Run Locally

1. Clone the repo
   
```bash
git clone https://github.com/yourusername/devcircle.git
cd devcircle
```

2. Setup MongoDB, Redis & RabbitMQ

Use Docker:

```bash
docker-compose up -d
```

3. Start each service

```bash
cd auth-service
npm install
npm run dev

# In a new terminal:
cd post-service
npm install
npm run dev

# Repeat for others...
```
