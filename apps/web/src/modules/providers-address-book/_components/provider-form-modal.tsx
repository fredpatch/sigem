import React, { useState, useEffect } from "react";
import { Provider, ProviderCategory, ContactPerson } from "../types";
import { X, Plus, Trash2 } from "lucide-react";

interface ProviderFormModalProps {
  provider: Provider | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Provider>) => Promise<void>;
  i18n: {
    addProvider: string;
    edit: string;
    save: string;
    cancel: string;
  };
}

export function ProviderFormModal({
  provider,
  isOpen,
  onClose,
  onSave,
  i18n,
}: ProviderFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "SUPPLIER" as ProviderCategory,
    phones: [""],
    emails: [""],
    address: {
      country: "",
      city: "",
      street: "",
      zipCode: "",
    },
    contacts: [] as ContactPerson[],
    tags: [] as string[],
    status: "ACTIVE" as "ACTIVE" | "DISABLED",
    notes: "",
  });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name,
        category: provider.category,
        phones: provider.phones.length > 0 ? provider.phones : [""],
        emails: provider.emails.length > 0 ? provider.emails : [""],
        address: {
          country: provider.address.country,
          city: provider.address.city,
          street: provider.address.street,
          zipCode: provider.address.zipCode || "",
        },
        contacts: provider.contacts,
        tags: provider.tags,
        status: provider.status,
        notes: provider.notes || "",
      });
    } else {
      setFormData({
        name: "",
        category: "SUPPLIER",
        phones: [""],
        emails: [""],
        address: { country: "", city: "", street: "", zipCode: "" },
        contacts: [],
        tags: [],
        status: "ACTIVE",
        notes: "",
      });
    }
  }, [provider, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanedData = {
        ...formData,
        phones: formData.phones.filter((p) => p.trim()),
        emails: formData.emails.filter((e) => e.trim()),
      };
      await onSave(cleanedData);
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const addPhone = () =>
    setFormData((prev) => ({ ...prev, phones: [...prev.phones, ""] }));
  const removePhone = (idx: number) =>
    setFormData((prev) => ({
      ...prev,
      phones: prev.phones.filter((_, i) => i !== idx),
    }));
  const updatePhone = (idx: number, value: string) =>
    setFormData((prev) => ({
      ...prev,
      phones: prev.phones.map((p, i) => (i === idx ? value : p)),
    }));

  const addEmail = () =>
    setFormData((prev) => ({ ...prev, emails: [...prev.emails, ""] }));
  const removeEmail = (idx: number) =>
    setFormData((prev) => ({
      ...prev,
      emails: prev.emails.filter((_, i) => i !== idx),
    }));
  const updateEmail = (idx: number, value: string) =>
    setFormData((prev) => ({
      ...prev,
      emails: prev.emails.map((e, i) => (i === idx ? value : e)),
    }));

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) =>
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));

  const addContact = () => {
    const newContact: ContactPerson = {
      id: `contact-${Date.now()}`,
      fullName: "",
      role: "",
      phone: "",
      email: "",
    };
    setFormData((prev) => ({
      ...prev,
      contacts: [...prev.contacts, newContact],
    }));
  };

  const removeContact = (id: string) =>
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((c) => c.id !== id),
    }));

  const updateContact = (
    id: string,
    field: keyof ContactPerson,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.map((c) =>
        c.id === id ? { ...c, [field]: value } : c,
      ),
    }));
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl my-8">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {provider ? i18n.edit : i18n.addProvider}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-6 max-h-[70vh] overflow-y-auto"
          >
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value as ProviderCategory,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SUPPLIER">Supplier</option>
                  <option value="CONTRACTOR">Contractor</option>
                  <option value="CONSULTANT">Consultant</option>
                  <option value="SERVICE_PROVIDER">Service Provider</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      status: e.target.value as "ACTIVE" | "DISABLED",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="DISABLED">Disabled</option>
                </select>
              </div>
            </div>

            {/* Phones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Numbers
              </label>
              {formData.phones.map((phone, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => updatePhone(idx, e.target.value)}
                    placeholder="+1-555-0100"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.phones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhone(idx)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPhone}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add phone
              </button>
            </div>

            {/* Emails */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Addresses
              </label>
              {formData.emails.map((email, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(idx, e.target.value)}
                    placeholder="contact@example.com"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmail(idx)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addEmail}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add email
              </button>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, street: e.target.value },
                    }))
                  }
                  placeholder="Street"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value },
                    }))
                  }
                  placeholder="City"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={formData.address.zipCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, zipCode: e.target.value },
                    }))
                  }
                  placeholder="Zip Code"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={formData.address.country}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, country: e.target.value },
                    }))
                  }
                  placeholder="Country"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                  placeholder="Add tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Persons */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Contact Persons
                </label>
                <button
                  type="button"
                  onClick={addContact}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add contact
                </button>
              </div>
              <div className="space-y-3">
                {formData.contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-end mb-2">
                      <button
                        type="button"
                        onClick={() => removeContact(contact.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={contact.fullName}
                        onChange={(e) =>
                          updateContact(contact.id, "fullName", e.target.value)
                        }
                        placeholder="Full Name"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                      <input
                        type="text"
                        value={contact.role}
                        onChange={(e) =>
                          updateContact(contact.id, "role", e.target.value)
                        }
                        placeholder="Role"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) =>
                          updateContact(contact.id, "phone", e.target.value)
                        }
                        placeholder="Phone"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(e) =>
                          updateContact(contact.id, "email", e.target.value)
                        }
                        placeholder="Email"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={4}
                placeholder="Additional notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              {i18n.cancel}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : i18n.save}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
