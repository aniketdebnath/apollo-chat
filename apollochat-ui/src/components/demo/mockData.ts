// Mock data for demo purposes
export const mockChats = [
  {
    _id: "demo-chat-1",
    name: "Product Team",
    latestMessage: {
      _id: "demo-message-1",
      content: "When will the new feature be ready?",
      createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
      chatId: "demo-chat-1",
      user: {
        _id: "demo-user-2",
        username: "Sarah",
        email: "sarah@example.com",
        imageUrl: "",
      },
    },
  },
  {
    _id: "demo-chat-2",
    name: "Marketing Campaign",
    latestMessage: {
      _id: "demo-message-2",
      content: "The presentation looks great! Let's share it with the team.",
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      chatId: "demo-chat-2",
      user: {
        _id: "demo-user-3",
        username: "Michael",
        email: "michael@example.com",
        imageUrl: "",
      },
    },
  },
  {
    _id: "demo-chat-3",
    name: "Design Workshop",
    latestMessage: {
      _id: "demo-message-3",
      content: "I've uploaded the latest mockups for review.",
      createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      chatId: "demo-chat-3",
      user: {
        _id: "demo-user-4",
        username: "Emily",
        email: "emily@example.com",
        imageUrl: "",
      },
    },
  },
  {
    _id: "demo-chat-4",
    name: "Project Alpha",
    latestMessage: {
      _id: "demo-message-4",
      content: "The client approved our proposal!",
      createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
      chatId: "demo-chat-4",
      user: {
        _id: "demo-user-5",
        username: "David",
        email: "david@example.com",
        imageUrl: "",
      },
    },
  },
  {
    _id: "demo-chat-5",
    name: "Frontend Team",
    latestMessage: {
      _id: "demo-message-5",
      content: "Has anyone tested the new components on mobile yet?",
      createdAt: new Date(Date.now() - 1.5 * 3600000).toISOString(),
      chatId: "demo-chat-5",
      user: {
        _id: "demo-user-6",
        username: "Alex",
        email: "alex@example.com",
        imageUrl: "",
      },
    },
  },
  {
    _id: "demo-chat-6",
    name: "Backend Discussions",
    latestMessage: {
      _id: "demo-message-6",
      content: "The new API endpoints are ready for integration testing.",
      createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      chatId: "demo-chat-6",
      user: {
        _id: "demo-user-7",
        username: "Jessica",
        email: "jessica@example.com",
        imageUrl: "",
      },
    },
  },
  {
    _id: "demo-chat-7",
    name: "Client Feedback",
    latestMessage: {
      _id: "demo-message-7",
      content: "The client is very happy with the progress so far!",
      createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      chatId: "demo-chat-7",
      user: {
        _id: "demo-user-8",
        username: "Robert",
        email: "robert@example.com",
        imageUrl: "",
      },
    },
  },
];

export const mockMessages = [
  {
    _id: "demo-msg-1",
    content: "Hi there! Welcome to Apollo Chat's demo mode.",
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    chatId: "demo-chat-1",
    user: {
      _id: "demo-user-2",
      username: "Sarah",
      email: "sarah@example.com",
      imageUrl: "",
    },
  },
  {
    _id: "demo-msg-2",
    content: "Can you provide an update on the product roadmap?",
    createdAt: new Date(Date.now() - 24 * 60000).toISOString(),
    chatId: "demo-chat-1",
    user: {
      _id: "demo-user-2",
      username: "Sarah",
      email: "sarah@example.com",
      imageUrl: "",
    },
  },
  {
    _id: "demo-msg-3",
    content:
      "I'm working on finalizing the timeline. Should have it ready by tomorrow.",
    createdAt: new Date(Date.now() - 23 * 60000).toISOString(),
    chatId: "demo-chat-1",
    user: {
      _id: "demo-user-1",
      username: "DemoUser",
      email: "demo@example.com",
      imageUrl: "",
    },
  },
  {
    _id: "demo-msg-4",
    content: "Great! Also, do we have any updates from the design team?",
    createdAt: new Date(Date.now() - 22 * 60000).toISOString(),
    chatId: "demo-chat-1",
    user: {
      _id: "demo-user-2",
      username: "Sarah",
      email: "sarah@example.com",
      imageUrl: "",
    },
  },
  {
    _id: "demo-msg-5",
    content:
      "They've shared the latest mockups in the Design Workshop channel.",
    createdAt: new Date(Date.now() - 21 * 60000).toISOString(),
    chatId: "demo-chat-1",
    user: {
      _id: "demo-user-1",
      username: "DemoUser",
      email: "demo@example.com",
      imageUrl: "",
    },
  },
  {
    _id: "demo-msg-6",
    content: "Perfect, I'll check them out.",
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(), // Time gap for second divider
    chatId: "demo-chat-1",
    user: {
      _id: "demo-user-2",
      username: "Sarah",
      email: "sarah@example.com",
      imageUrl: "",
    },
  },
  {
    _id: "demo-msg-7",
    content: "When will the new feature be ready?",
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    chatId: "demo-chat-1",
    user: {
      _id: "demo-user-2",
      username: "Sarah",
      email: "sarah@example.com",
      imageUrl: "",
    },
  },
];
