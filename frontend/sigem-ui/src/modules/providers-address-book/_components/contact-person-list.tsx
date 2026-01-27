import { ContactPerson } from "../types";
import { Mail, Phone, User } from "lucide-react";

interface ContactPersonsListProps {
  contacts: ContactPerson[];
}

export function ContactPersonsList({ contacts }: ContactPersonsListProps) {
  if (contacts.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">No contacts available</div>
    );
  }

  return (
    <div className="space-y-3">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="p-3 bg-gray-50 rounded-lg border border-gray-200"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900">
                {contact.fullName}
              </div>
              <div className="text-xs text-gray-500 mb-2">{contact.role}</div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-gray-700 hover:text-blue-600"
                  >
                    {contact.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-gray-700 hover:text-blue-600 truncate"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
