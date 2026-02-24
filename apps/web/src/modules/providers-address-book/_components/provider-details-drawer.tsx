import { Provider } from "../types";
import { ContactPersonsList } from "./contact-person-list";
import {
  X,
  MapPin,
  Mail,
  Phone,
  Tag,
  Calendar,
  User,
  FileText,
} from "lucide-react";

interface ProviderDetailsDrawerProps {
  provider: Provider | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProviderDetailsDrawer({
  provider,
  isOpen,
  onClose,
}: ProviderDetailsDrawerProps) {
  if (!isOpen || !provider) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] bg-white z-50 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {provider.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {provider.category.replace("_", " ")}
              </span>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  provider.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {provider.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Contact Information */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Contact Information
            </h3>
            <div className="space-y-3">
              {provider.phones.map((phone, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <a
                    href={`tel:${phone}`}
                    className="text-gray-700 hover:text-blue-600"
                  >
                    {phone}
                  </a>
                </div>
              ))}
              {provider.emails.map((email, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-green-600" />
                  </div>
                  <a
                    href={`mailto:${email}`}
                    className="text-gray-700 hover:text-blue-600 break-all"
                  >
                    {email}
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Address */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Address
            </h3>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-gray-700">
                <div>{provider.address.street}</div>
                <div>
                  {provider.address.city}, {provider.address.zipCode || ""}
                </div>
                <div>{provider.address.country}</div>
              </div>
            </div>
          </section>

          {/* Tags */}
          {provider.tags.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {provider.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Contact Persons */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Contact Persons
            </h3>
            <ContactPersonsList contacts={provider.contacts} />
          </section>

          {/* Notes */}
          {provider.notes && (
            <section>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notes
              </h3>
              <div className="p-3 bg-gray-50 rounded-lg text-gray-700 text-sm whitespace-pre-wrap">
                {provider.notes}
              </div>
            </section>
          )}

          {/* Metadata */}
          <section className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Created: {new Date(provider.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Updated: {new Date(provider.updatedAt).toLocaleDateString()}
                </span>
              </div>
              {provider.createdBy && (
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>Created by: {provider.createdBy}</span>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
