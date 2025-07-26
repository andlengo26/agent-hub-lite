// Mock data for Customer Support AI Agent Admin Portal

export interface Organization {
  id: string;
  name: string;
  logoUrl: string;
  activeAgents: number;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface User {
  id: string;
  avatarUrl: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'agent' | 'manager';
  onlineStatus: 'online' | 'offline' | 'away';
  createdAt: string;
}

export interface Chat {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  ipAddress: string;
  browser: string;
  pageUrl: string;
  subject: string;
  status: 'active' | 'missed' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedAgentId: string;
  lastMessage: string;
  messageCount: number;
  createdAt: string;
  lastUpdatedAt: string;
  // Enhanced properties for closed chats
  callRecordingUrl?: string;
  uploadedFiles?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  transcript?: Array<{
    id: string;
    sender: 'customer' | 'agent' | 'system';
    message: string;
    timestamp: string;
  }>;
}

export interface Engagement {
  id: string;
  customerName: string;
  customerEmail: string;
  contactNumber: string;
  engagementCount: number;
  lastEngagedAt: string;
  agentsInvolved: string[];
  aiSummary: string;
}

export interface Document {
  id: string;
  title: string;
  fileType: string;
  fileSizeKb: number;
  uploadedById: string;
  uploadedAt: string;
  lastModifiedAt: string;
}

export interface ScraperJob {
  id: string;
  url: string;
  linkDepth: number;
  frequency: string;
  lastScrapedAt: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  title: string;
  tags: string[];
  type: 'document' | 'video' | 'link' | 'template';
  url: string;
  aiInstructions: string;
  uploadedById: string;
  uploadedAt: string;
  updatedAt: string;
}

export interface Domain {
  id: string;
  domain: string;
  addedById: string;
  addedAt: string;
}

// Mock data
export const mockOrganizations: Organization[] = [
  {
    id: "1",
    name: "TechCorp Solutions",
    logoUrl: "/placeholder.svg",
    activeAgents: 12,
    createdAt: "2024-01-15T10:30:00Z",
    status: "active"
  },
  {
    id: "2",
    name: "Digital Dynamics",
    logoUrl: "/placeholder.svg",
    activeAgents: 8,
    createdAt: "2024-02-20T14:15:00Z",
    status: "active"
  },
  {
    id: "3",
    name: "Innovation Labs",
    logoUrl: "/placeholder.svg",
    activeAgents: 15,
    createdAt: "2024-03-10T09:45:00Z",
    status: "inactive"
  },
  {
    id: "4",
    name: "Global Services Inc",
    logoUrl: "/placeholder.svg",
    activeAgents: 25,
    createdAt: "2024-01-05T16:20:00Z",
    status: "active"
  },
  {
    id: "5",
    name: "Future Tech",
    logoUrl: "/placeholder.svg",
    activeAgents: 6,
    createdAt: "2024-04-12T11:10:00Z",
    status: "active"
  }
];

export const mockUsers: User[] = [
  {
    id: "1",
    avatarUrl: "/placeholder.svg",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    role: "admin",
    onlineStatus: "online",
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    avatarUrl: "/placeholder.svg",
    firstName: "Sarah",
    lastName: "Smith",
    email: "sarah.smith@example.com",
    role: "agent",
    onlineStatus: "online",
    createdAt: "2024-02-20T14:15:00Z"
  },
  {
    id: "3",
    avatarUrl: "/placeholder.svg",
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike.johnson@example.com",
    role: "manager",
    onlineStatus: "away",
    createdAt: "2024-03-10T09:45:00Z"
  },
  {
    id: "4",
    avatarUrl: "/placeholder.svg",
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@example.com",
    role: "agent",
    onlineStatus: "offline",
    createdAt: "2024-01-05T16:20:00Z"
  },
  {
    id: "5",
    avatarUrl: "/placeholder.svg",
    firstName: "Robert",
    lastName: "Wilson",
    email: "robert.wilson@example.com",
    role: "agent",
    onlineStatus: "online",
    createdAt: "2024-04-12T11:10:00Z"
  }
];

export const mockChats: Chat[] = [
  {
    id: "chat_001",
    customerId: "cust_001",
    customerName: "Alice Brown",
    customerEmail: "alice.brown@email.com",
    requesterName: "Alice Brown",
    requesterEmail: "alice.brown@email.com",
    requesterPhone: "+1-555-0123",
    ipAddress: "192.168.1.100",
    browser: "Chrome 120.0",
    pageUrl: "https://example.com/support",
    subject: "Need help with account setup",
    status: "active",
    priority: "medium",
    assignedAgentId: "2",
    lastMessage: "Can you help me configure my account settings?",
    messageCount: 4,
    createdAt: "2024-07-26T10:30:00Z",
    lastUpdatedAt: "2024-07-26T10:35:00Z",
    transcript: [
      {
        id: "msg_001",
        sender: "customer",
        message: "Hi, I need help setting up my account",
        timestamp: "2024-07-26T10:30:00Z"
      },
      {
        id: "msg_002",
        sender: "agent",
        message: "Hello! I'd be happy to help you with your account setup. What specific area are you having trouble with?",
        timestamp: "2024-07-26T10:31:00Z"
      }
    ]
  },
  {
    id: "chat_002",
    customerId: "cust_002",
    customerName: "Bob Green",
    customerEmail: "bob.green@email.com",
    requesterName: "Bob Green",
    requesterEmail: "bob.green@email.com",
    requesterPhone: "+1-555-0124",
    ipAddress: "192.168.1.101",
    browser: "Firefox 121.0",
    pageUrl: "https://example.com/pricing",
    subject: "Pricing inquiry for enterprise plan",
    status: "missed",
    priority: "high",
    assignedAgentId: "3",
    lastMessage: "Customer left chat before agent response",
    messageCount: 1,
    createdAt: "2024-07-26T09:15:00Z",
    lastUpdatedAt: "2024-07-26T09:20:00Z"
  },
  {
    id: "chat_003",
    customerId: "cust_003",
    customerName: "Carol White",
    customerEmail: "carol.white@email.com",
    requesterName: "Carol White",
    requesterEmail: "carol.white@email.com",
    requesterPhone: "+1-555-0125",
    ipAddress: "192.168.1.102",
    browser: "Safari 17.0",
    pageUrl: "https://example.com/features",
    subject: "Technical issue with API integration",
    status: "closed",
    priority: "urgent",
    assignedAgentId: "4",
    lastMessage: "Issue resolved. Thank you for your help!",
    messageCount: 12,
    createdAt: "2024-07-26T08:45:00Z",
    lastUpdatedAt: "2024-07-26T09:10:00Z",
    callRecordingUrl: "/recordings/chat_003_call.mp3",
    uploadedFiles: [
      {
        id: "file_001",
        name: "error_log.txt",
        url: "/uploads/error_log.txt",
        type: "text/plain",
        size: 2048
      }
    ],
    transcript: [
      {
        id: "msg_003",
        sender: "customer",
        message: "I'm getting a 500 error when calling your API",
        timestamp: "2024-07-26T08:45:00Z"
      },
      {
        id: "msg_004",
        sender: "agent",
        message: "I see the issue. Let me check your API key configuration.",
        timestamp: "2024-07-26T08:46:00Z"
      }
    ]
  },
  {
    id: "chat_004",
    customerId: "cust_004",
    customerName: "David Black",
    customerEmail: "david.black@email.com",
    requesterName: "David Black",
    requesterEmail: "david.black@email.com",
    requesterPhone: "+1-555-0126",
    ipAddress: "192.168.1.103",
    browser: "Edge 120.0",
    pageUrl: "https://example.com/contact",
    subject: "General product inquiry",
    status: "active",
    priority: "low",
    assignedAgentId: "5",
    lastMessage: "What features are included in the basic plan?",
    messageCount: 2,
    createdAt: "2024-07-26T11:00:00Z",
    lastUpdatedAt: "2024-07-26T11:05:00Z"
  },
  {
    id: "chat_005",
    customerId: "cust_005",
    customerName: "Eva Gray",
    customerEmail: "eva.gray@email.com",
    requesterName: "Eva Gray",
    requesterEmail: "eva.gray@email.com",
    requesterPhone: "+1-555-0127",
    ipAddress: "192.168.1.104",
    browser: "Chrome 120.0",
    pageUrl: "https://example.com/home",
    subject: "Billing question about invoice",
    status: "closed",
    priority: "medium",
    assignedAgentId: "2",
    lastMessage: "Perfect, my billing issue is now resolved!",
    messageCount: 8,
    createdAt: "2024-07-26T07:30:00Z",
    lastUpdatedAt: "2024-07-26T08:15:00Z",
    transcript: [
      {
        id: "msg_005",
        sender: "customer",
        message: "I have a question about my latest invoice",
        timestamp: "2024-07-26T07:30:00Z"
      },
      {
        id: "msg_006",
        sender: "agent",
        message: "I'd be happy to help with your billing question. Can you provide your account number?",
        timestamp: "2024-07-26T07:31:00Z"
      }
    ]
  }
];

export const mockEngagements: Engagement[] = [
  {
    id: "1",
    customerName: "Alice Brown",
    customerEmail: "alice.brown@email.com",
    contactNumber: "+1-555-0123",
    engagementCount: 5,
    lastEngagedAt: "2024-07-26T10:30:00Z",
    agentsInvolved: ["2", "3"],
    aiSummary: "Customer inquired about pricing plans and requested a demo. Issue resolved with product demonstration."
  },
  {
    id: "2",
    customerName: "Bob Green",
    customerEmail: "bob.green@email.com",
    contactNumber: "+1-555-0124",
    engagementCount: 2,
    lastEngagedAt: "2024-07-26T09:15:00Z",
    agentsInvolved: ["3"],
    aiSummary: "Technical support request regarding API integration. Provided documentation and code examples."
  },
  {
    id: "3",
    customerName: "Carol White",
    customerEmail: "carol.white@email.com",
    contactNumber: "+1-555-0125",
    engagementCount: 8,
    lastEngagedAt: "2024-07-26T08:45:00Z",
    agentsInvolved: ["4", "2"],
    aiSummary: "Billing inquiry resolved. Updated payment method and provided account access."
  },
  {
    id: "4",
    customerName: "David Black",
    customerEmail: "david.black@email.com",
    contactNumber: "+1-555-0126",
    engagementCount: 1,
    lastEngagedAt: "2024-07-26T11:00:00Z",
    agentsInvolved: ["5"],
    aiSummary: "First-time user onboarding. Guided through setup process and initial configuration."
  },
  {
    id: "5",
    customerName: "Eva Gray",
    customerEmail: "eva.gray@email.com",
    contactNumber: "+1-555-0127",
    engagementCount: 3,
    lastEngagedAt: "2024-07-26T07:30:00Z",
    agentsInvolved: ["2"],
    aiSummary: "Feature request discussion. Logged enhancement request for development team review."
  }
];

export const mockDocuments: Document[] = [
  {
    id: "1",
    title: "User Guide v2.1.pdf",
    fileType: "PDF",
    fileSizeKb: 2048,
    uploadedById: "1",
    uploadedAt: "2024-07-20T14:30:00Z",
    lastModifiedAt: "2024-07-25T16:45:00Z"
  },
  {
    id: "2",
    title: "API Documentation.docx",
    fileType: "DOCX",
    fileSizeKb: 1024,
    uploadedById: "2",
    uploadedAt: "2024-07-18T10:15:00Z",
    lastModifiedAt: "2024-07-24T09:20:00Z"
  },
  {
    id: "3",
    title: "Troubleshooting Guide.pdf",
    fileType: "PDF",
    fileSizeKb: 3072,
    uploadedById: "3",
    uploadedAt: "2024-07-15T12:00:00Z",
    lastModifiedAt: "2024-07-22T14:30:00Z"
  },
  {
    id: "4",
    title: "Product Roadmap.xlsx",
    fileType: "XLSX",
    fileSizeKb: 512,
    uploadedById: "1",
    uploadedAt: "2024-07-10T08:45:00Z",
    lastModifiedAt: "2024-07-20T11:15:00Z"
  },
  {
    id: "5",
    title: "Training Materials.pptx",
    fileType: "PPTX",
    fileSizeKb: 4096,
    uploadedById: "4",
    uploadedAt: "2024-07-08T16:20:00Z",
    lastModifiedAt: "2024-07-18T13:10:00Z"
  }
];

export const mockScraperJobs: ScraperJob[] = [
  {
    id: "1",
    url: "https://docs.example.com",
    linkDepth: 3,
    frequency: "daily",
    lastScrapedAt: "2024-07-26T06:00:00Z",
    status: "completed"
  },
  {
    id: "2",
    url: "https://support.example.com",
    linkDepth: 2,
    frequency: "weekly",
    lastScrapedAt: "2024-07-24T12:00:00Z",
    status: "completed"
  },
  {
    id: "3",
    url: "https://blog.example.com",
    linkDepth: 1,
    frequency: "monthly",
    lastScrapedAt: "2024-07-20T18:00:00Z",
    status: "failed"
  },
  {
    id: "4",
    url: "https://knowledge.example.com",
    linkDepth: 4,
    frequency: "daily",
    lastScrapedAt: "2024-07-26T06:30:00Z",
    status: "running"
  },
  {
    id: "5",
    url: "https://help.example.com",
    linkDepth: 2,
    frequency: "weekly",
    lastScrapedAt: "2024-07-25T09:00:00Z",
    status: "pending"
  }
];

export const mockFAQs: FAQ[] = [
  {
    id: "1",
    question: "How do I reset my password?",
    answer: "Click on 'Forgot Password' link on the login page and follow the instructions sent to your email.",
    tags: ["password", "login", "account"],
    createdAt: "2024-07-15T10:00:00Z",
    updatedAt: "2024-07-20T14:30:00Z"
  },
  {
    id: "2",
    question: "What are the system requirements?",
    answer: "Our platform supports modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+) and requires JavaScript enabled.",
    tags: ["system", "requirements", "browser"],
    createdAt: "2024-07-16T11:15:00Z",
    updatedAt: "2024-07-22T09:45:00Z"
  },
  {
    id: "3",
    question: "How can I upgrade my plan?",
    answer: "Go to Settings > Billing and select 'Upgrade Plan'. Choose your desired plan and complete the payment process.",
    tags: ["billing", "upgrade", "plan"],
    createdAt: "2024-07-17T14:20:00Z",
    updatedAt: "2024-07-25T16:10:00Z"
  },
  {
    id: "4",
    question: "Is there a mobile app available?",
    answer: "Yes, our mobile apps are available on both iOS App Store and Google Play Store.",
    tags: ["mobile", "app", "download"],
    createdAt: "2024-07-18T09:30:00Z",
    updatedAt: "2024-07-24T12:20:00Z"
  },
  {
    id: "5",
    question: "How do I contact support?",
    answer: "You can contact our support team via live chat, email at support@example.com, or phone at 1-800-SUPPORT.",
    tags: ["support", "contact", "help"],
    createdAt: "2024-07-19T16:45:00Z",
    updatedAt: "2024-07-26T08:15:00Z"
  }
];

export const mockResources: Resource[] = [
  {
    id: "1",
    title: "Getting Started Guide",
    tags: ["tutorial", "beginner", "setup"],
    type: "document",
    url: "/resources/getting-started.pdf",
    aiInstructions: "Use this guide to help new users with initial setup and basic features.",
    uploadedById: "1",
    uploadedAt: "2024-07-15T10:00:00Z",
    updatedAt: "2024-07-20T14:30:00Z"
  },
  {
    id: "2",
    title: "Product Demo Video",
    tags: ["demo", "video", "features"],
    type: "video",
    url: "/resources/product-demo.mp4",
    aiInstructions: "Share this video when customers want to see product capabilities in action.",
    uploadedById: "2",
    uploadedAt: "2024-07-16T11:15:00Z",
    updatedAt: "2024-07-22T09:45:00Z"
  },
  {
    id: "3",
    title: "API Reference",
    tags: ["api", "technical", "developer"],
    type: "link",
    url: "https://api.example.com/docs",
    aiInstructions: "Direct developers to this comprehensive API documentation for integration help.",
    uploadedById: "3",
    uploadedAt: "2024-07-17T14:20:00Z",
    updatedAt: "2024-07-25T16:10:00Z"
  },
  {
    id: "4",
    title: "Support Ticket Template",
    tags: ["template", "support", "ticket"],
    type: "template",
    url: "/resources/ticket-template.txt",
    aiInstructions: "Use this template structure when creating support tickets for complex issues.",
    uploadedById: "4",
    uploadedAt: "2024-07-18T09:30:00Z",
    updatedAt: "2024-07-24T12:20:00Z"
  },
  {
    id: "5",
    title: "Troubleshooting Checklist",
    tags: ["troubleshooting", "checklist", "debug"],
    type: "document",
    url: "/resources/troubleshooting.pdf",
    aiInstructions: "Walk customers through this systematic troubleshooting process for common issues.",
    uploadedById: "5",
    uploadedAt: "2024-07-19T16:45:00Z",
    updatedAt: "2024-07-26T08:15:00Z"
  }
];

export const mockDomains: Domain[] = [
  {
    id: "1",
    domain: "example.com",
    addedById: "1",
    addedAt: "2024-07-15T10:00:00Z"
  },
  {
    id: "2",
    domain: "support.example.com",
    addedById: "1",
    addedAt: "2024-07-16T11:15:00Z"
  },
  {
    id: "3",
    domain: "app.example.com",
    addedById: "2",
    addedAt: "2024-07-17T14:20:00Z"
  },
  {
    id: "4",
    domain: "docs.example.com",
    addedById: "3",
    addedAt: "2024-07-18T09:30:00Z"
  },
  {
    id: "5",
    domain: "api.example.com",
    addedById: "1",
    addedAt: "2024-07-19T16:45:00Z"
  }
];

// Consolidated export
export const mockData = {
  chats: mockChats,
  users: mockUsers,
  organizations: mockOrganizations,
  engagements: mockEngagements,
  documents: mockDocuments,
  scraperJobs: mockScraperJobs,
  faqs: mockFAQs,
  resources: mockResources,
  domains: mockDomains
};