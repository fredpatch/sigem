import { ProviderDataSource } from "./adapters/types";
import { Provider } from "./types";

const MOCK_PROVIDERS: Provider[] = [
  {
    id: "1",
    name: "Acme Supplies Inc.",
    category: "SUPPLIER",
    phones: ["+1-555-0100", "+1-555-0101"],
    emails: ["contact@acmesupplies.com", "sales@acmesupplies.com"],
    address: {
      country: "USA",
      city: "New York",
      street: "123 Broadway Ave",
      zipCode: "10001",
    },
    contacts: [
      {
        id: "c1",
        fullName: "John Smith",
        role: "Account Manager",
        phone: "+1-555-0102",
        email: "john.smith@acmesupplies.com",
      },
      {
        id: "c2",
        fullName: "Sarah Johnson",
        role: "Sales Director",
        phone: "+1-555-0103",
        email: "sarah.j@acmesupplies.com",
      },
    ],
    tags: ["verified", "premium", "fast-delivery"],
    status: "ACTIVE",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-11-20T14:30:00Z",
    createdBy: "admin@company.com",
    notes:
      "Reliable supplier with excellent track record. Net 30 payment terms.",
  },
  {
    id: "2",
    name: "BuildRight Contractors",
    category: "CONTRACTOR",
    phones: ["+1-555-0200"],
    emails: ["info@buildright.com"],
    address: {
      country: "USA",
      city: "Los Angeles",
      street: "456 Construction Blvd",
      zipCode: "90001",
    },
    contacts: [
      {
        id: "c3",
        fullName: "Mike Williams",
        role: "Project Manager",
        phone: "+1-555-0201",
        email: "mike.w@buildright.com",
      },
    ],
    tags: ["licensed", "insured"],
    status: "ACTIVE",
    createdAt: "2024-03-10T09:00:00Z",
    updatedAt: "2024-12-01T16:45:00Z",
    createdBy: "procurement@company.com",
    notes: "Specialized in commercial construction. Good rates.",
  },
  {
    id: "3",
    name: "TechConsult Group",
    category: "CONSULTANT",
    phones: ["+1-555-0300"],
    emails: ["hello@techconsult.com"],
    address: {
      country: "USA",
      city: "San Francisco",
      street: "789 Tech Street",
      zipCode: "94102",
    },
    contacts: [
      {
        id: "c4",
        fullName: "Emily Chen",
        role: "Lead Consultant",
        phone: "+1-555-0301",
        email: "emily.chen@techconsult.com",
      },
    ],
    tags: ["agile", "cloud-expert"],
    status: "DISABLED",
    createdAt: "2024-02-20T11:00:00Z",
    updatedAt: "2024-10-15T12:00:00Z",
    createdBy: "hr@company.com",
    notes: "Currently on hold pending contract renewal.",
  },
  {
    id: "4",
    name: "CleanPro Services",
    category: "SERVICE_PROVIDER",
    phones: ["+1-555-0400", "+1-555-0401"],
    emails: ["bookings@cleanpro.com"],
    address: {
      country: "USA",
      city: "Chicago",
      street: "321 Service Lane",
      zipCode: "60601",
    },
    contacts: [
      {
        id: "c5",
        fullName: "David Martinez",
        role: "Operations Manager",
        phone: "+1-555-0402",
        email: "david.m@cleanpro.com",
      },
    ],
    tags: ["eco-friendly", "certified"],
    status: "ACTIVE",
    createdAt: "2024-04-05T08:00:00Z",
    updatedAt: "2024-12-10T10:15:00Z",
    createdBy: "facilities@company.com",
  },
  {
    id: "5",
    name: "Global Logistics Partners",
    category: "SUPPLIER",
    phones: ["+1-555-0500"],
    emails: ["dispatch@globallogistics.com", "support@globallogistics.com"],
    address: {
      country: "USA",
      city: "Houston",
      street: "555 Logistics Way",
      zipCode: "77001",
    },
    contacts: [
      {
        id: "c6",
        fullName: "Amanda Rodriguez",
        role: "Logistics Coordinator",
        phone: "+1-555-0501",
        email: "amanda.r@globallogistics.com",
      },
    ],
    tags: ["international", "24-7"],
    status: "ACTIVE",
    createdAt: "2024-05-12T07:30:00Z",
    updatedAt: "2024-11-28T09:00:00Z",
    createdBy: "operations@company.com",
    notes: "Excellent for international shipments. Available 24/7.",
  },
];

let mockData = [...MOCK_PROVIDERS];

export const mockDataSource: ProviderDataSource = {
  async list(filters, sort, pagination) {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

    let filtered = [...mockData];

    // Apply filters
    if (filters) {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(search) ||
            p.phones.some((ph) => ph.includes(search)) ||
            p.emails.some((em) => em.toLowerCase().includes(search)) ||
            p.tags.some((t) => t.toLowerCase().includes(search)),
        );
      }

      if (filters.status) {
        filtered = filtered.filter((p) => p.status === filters.status);
      }

      if (filters.category) {
        filtered = filtered.filter((p) => p.category === filters.category);
      }

      if (filters.city) {
        filtered = filtered.filter((p) =>
          p.address.city.toLowerCase().includes(filters.city!.toLowerCase()),
        );
      }

      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter((p) =>
          filters.tags!.some((tag) => p.tags.includes(tag)),
        );
      }
    }

    // Apply sorting
    if (sort) {
      filtered.sort((a, b) => {
        const aVal = a[sort.field] as any;
        const bVal = b[sort.field] as any;

        if (aVal < bVal) return sort.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sort.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    const total = filtered.length;

    // Apply pagination
    if (pagination) {
      const start = (pagination.page - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      filtered = filtered.slice(start, end);
    }

    return {
      data: filtered,
      total,
      page: pagination?.page || 1,
      pageSize: pagination?.pageSize || total,
    };
  },

  async getById(id) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockData.find((p) => p.id === id) || null;
  },

  async create(provider) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newProvider: Provider = {
      ...provider,
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockData.push(newProvider);
    return newProvider;
  },

  async update(id, updates) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = mockData.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Provider not found");

    mockData[index] = {
      ...mockData[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return mockData[index];
  },

  async disable(id) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const index = mockData.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Provider not found");

    mockData[index].status = "DISABLED";
    mockData[index].updatedAt = new Date().toISOString();
  },

  async enable(id) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const index = mockData.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Provider not found");

    mockData[index].status = "ACTIVE";
    mockData[index].updatedAt = new Date().toISOString();
  },

  async delete(id) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    mockData = mockData.filter((p) => p.id !== id);
  },
};
