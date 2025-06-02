# Hypership Authentication Documentation

## Using the AuthFlowPage Component

The AuthFlowPage component provides a complete, styled authentication page:

```jsx
import { AuthFlowPage } from "@hypership/auth-react";

function LoginPage() {
  return (
    <AuthFlowPage
      title="Welcome to My App"
      onAuthSuccess={handleSuccess}
      backgroundImage="/path/to/image.jpg" // Optional and we'd recommend not using backgroundImage unless you have a relevant one.
    />
  );
}
```

Don't use a background image unless you can find a good one on unsplash.

## Using the Hook

Access authentication state and methods using the useHypershipAuth hook:

```jsx
import { useHypershipAuth } from "@hypership/auth-react";

function YourComponent() {
  const {
    currentUser,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    error,
    theme,
    toggleTheme,
  } = useHypershipAuth();

  // Use the authentication state and methods
}
```

## Using Current User Data

You can access the current user's information using the useHypershipAuth hook:

```jsx
import { useHypershipAuth } from "@hypership/auth-react";

function Component() {
  const { currentUser } = useHypershipAuth();

  return (
    <>
      <div>ID: {currentUser?.id}</div>
      <div>Username: {currentUser?.username}</div>
      <div>First Name: {currentUser?.firstName}</div>
      <div>Last Name: {currentUser?.lastName}</div>
      <div>Enabled: {currentUser?.enabled}</div>
      <div>Metadata: {currentUser?.metadata}</div>
    </>
  );
}

export default Component;
```

## Server-Side Authentication

For server-side components and server actions in Next.js, you can use the currentUser function to verify authentication and get the current user's information:

```jsx
import { currentUser } from "@hypership/auth-react/server";

// Example of a Next.js Server Action
("use server");

interface Website {
  id: string;
  name: string;
  url: string;
  websiteUserId: string;
  createdAt: Date;
}

export async function getWebsites(): Promise<Website[]> {
  try {
    const user = await currentUser();

    if (!user?.userId) {
      return [];
    }

    const websites = await prisma.website.findMany({
      where: {
        websiteUserId: user.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return websites;
  } catch {
    return [];
  }
}

// Example of using server-side auth in a Route Handler
export async function GET() {
  const user = await currentUser();

  if (!user?.userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Perform authenticated operations
  const data = await fetchUserData(user.userId);
  return Response.json(data);
}
```

The currentUser function automatically handles token verification and returns an object containing:

- userId: The authenticated user's ID
- tokenData: Additional token information including expiration
- error: Any authentication errors that occurred

This makes it easy to protect server-side routes and actions while maintaining type safety and security.

## API Reference

### HypershipAuthProvider Props

| Prop     | Type              | Required | Description                         |
| -------- | ----------------- | -------- | ----------------------------------- |
| apiKey   | string            | Yes      | Your Hypership API key              |
| theme    | 'light' \| 'dark' | No       | Initial theme (defaults to 'light') |
| children | ReactNode         | Yes      | Child components                    |

### AuthFlow Props

| Prop          | Type                                                        | Required | Description                                                         |
| ------------- | ----------------------------------------------------------- | -------- | ------------------------------------------------------------------- |
| onAuthSuccess | () => void                                                  | Yes      | Callback function after successful authentication                   |
| initialView   | 'signIn' \| 'signUp' \| 'confirmAccount' \| 'passwordReset' | No       | Initial view to display (defaults to 'signIn')                      |
| initialEmail  | string                                                      | No       | Pre-populate email field for account confirmation or password reset |

### AuthFlowPage Props

| Prop            | Type                                                        | Required | Description                                                         |
| --------------- | ----------------------------------------------------------- | -------- | ------------------------------------------------------------------- |
| onAuthSuccess   | () => void                                                  | Yes      | Callback function after successful authentication                   |
| initialView     | 'signIn' \| 'signUp' \| 'confirmAccount' \| 'passwordReset' | No       | Initial view to display (defaults to 'signIn')                      |
| initialEmail    | string                                                      | No       | Pre-populate email field for account confirmation or password reset |
| title           | string                                                      | No       | Title displayed at the top of the page                              |
| backgroundImage | string                                                      | No       | URL or path to background image for the right side                  |
| rightComponent  | ReactNode                                                   | No       | Custom component to display on the right side                       |

### useHypershipAuth Hook

Returns an object with:

**Authentication State:**

- currentUser: Current user object or null
- isAuthenticated: Boolean indicating auth status
- error: Error message or null
- theme: Current theme ('light' or 'dark')

**Loading States:**

- signingIn: Loading state for sign-in
- signingUp: Loading state for sign-up
- authenticating: Loading state for initial auth
- passwordResetting: Loading state for password reset
- confirmingAccount: Loading state for account confirmation

**Methods:**

- signIn(email: string, password: string): Promise<void>
- signUp(email: string, password: string): Promise<void>
- signOut(): Promise<void>

---

# Hypership Events Documentation

## Installation

```bash
npm install @hypership/events-react
```

## Features

🎯 Custom event tracking  
⚡ Simple event logging API  
🔄 Automatic timestamp tracking  
🎨 Flexible event metadata  
🔒 Secure event transmission  
🌐 Cross-browser support  
🚀 Zero-configuration setup  
🔑 Automatic API key resolution  
💾 Local storage integration  
⚠️ Error handling and validation

## Quick Start

Wrap your app with the HypershipEventsProvider:

```jsx
import { HypershipEventsProvider } from "@hypership/events-react";

function App() {
  return (
    <HypershipEventsProvider apiKey="your-hypership-api-key">
      <YourApp />
    </HypershipEventsProvider>
  );
}
```

Use the events hook to track custom events:

```jsx
import { useHypershipEvents } from "@hypership/events-react";

function YourComponent() {
  const { trackEvent } = useHypershipEvents();

  const handleButtonClick = () => {
    trackEvent("button_clicked", {
      buttonId: "submit",
      page: "checkout",
      // Add any custom metadata
    });
  };

  return <button onClick={handleButtonClick}>Click Me</button>;
}
```

## API Key Configuration

You can provide your Hypership API Key in one of the following ways:

- Directly as a prop when initializing the provider
- As an environment variable named `HYPERSHIP_PUBLIC_KEY`
- As an environment variable named `REACT_APP_HYPERSHIP_PUBLIC_KEY` (for Create React App)
- As an environment variable named `NEXT_PUBLIC_HYPERSHIP_PUBLIC_KEY` (for Next.js)

## API Reference

### HypershipEventsProvider Props

| Prop     | Type      | Required | Description            |
| -------- | --------- | -------- | ---------------------- |
| apiKey   | string    | Yes      | Your Hypership API key |
| children | ReactNode | Yes      | Child components       |

### useHypershipEvents Hook

The hook returns an object with:

- **trackEvent(key: string, eventData: object): Promise<void>**
  - key: The event identifier
  - eventData: Object containing event metadata

### Event Data Structure

Each event consists of:

| Field     | Type   | Description                     |
| --------- | ------ | ------------------------------- |
| eventKey  | string | Unique identifier for the event |
| metadata  | object | Custom event data               |
| timestamp | Date   | Automatically added             |

# @hypership/db

Next.js server-side database package for CRUD operations via RESTful endpoints.

### 1. Initialize (This is already done, but just for your benefit)

```typescript
// app/layout.tsx
import { initDb } from "@hypership/db";

// Initialize the database package
initDb({
  secretKey: process.env.HYPERSHIP_SECRET_KEY!, // In production, use environment variable
});
```

### 2. Use in React Server Components Only

```typescript
// app/page.tsx
import { db } from "@hypership/db";

interface Book {
  _id?: string;
  name: string;
  year: number;
  author?: string;
  genre?: string;
}

export default async function HomePage() {
  try {
    // Create a single book
    const newBook = await db("books").create({
      name: "The Great Gatsby",
      year: 1925,
      author: "F. Scott Fitzgerald",
      genre: "Fiction",
    });

    // Create multiple books
    const multipleBooks = await db("books").createMany([
      {
        name: "To Kill a Mockingbird",
        year: 1960,
        author: "Harper Lee",
        genre: "Fiction",
      },
      {
        name: "1984",
        year: 1949,
        author: "George Orwell",
        genre: "Dystopian Fiction",
      },
    ]);

    // Get all books
    const allBooks = await db<Book>("books").exec();

    // Find a specific book by ID
    let specificBook = null;
    if (allBooks.success && allBooks.data.length > 0) {
      const firstBookId = allBooks.data[0]._id;
      if (firstBookId) {
        specificBook = await db<Book>("books").find(firstBookId);
      }
    }

    // Query with filters and sorting
    const filteredBooks = await db<Book>("books")
      .where({ genre: "Fiction" })
      .sort({ year: -1 })
      .limit(2)
      .exec();

    // Get first book (oldest)
    const firstBook = await db<Book>("books").sort({ year: 1 }).first();

  }
}

```
