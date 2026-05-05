import type { ModelDefinition } from "@intentform/shared";
import { z } from "zod";

export const contactFormModel: ModelDefinition = {
  id: "contactForm",
  label: "Contact Form",
  description: "General contact and support request form",
  useCases: ["contact", "support", "inquiry", "feedback", "question"],
  fields: [
    {
      id: "name",
      label: "Full Name",
      type: "text",
      placeholder: "Your name",
      required: true,
    },
    {
      id: "email",
      label: "Email",
      type: "email",
      placeholder: "you@example.com",
      required: true,
    },
    {
      id: "phone",
      label: "Phone",
      type: "phone",
      placeholder: "+1 555 000 0000",
    },
    {
      id: "subject",
      label: "Subject",
      type: "text",
      placeholder: "What is this about?",
    },
    {
      id: "message",
      label: "Message",
      type: "textarea",
      placeholder: "Describe your request...",
      required: true,
    },
    {
      id: "urgency",
      label: "Urgency",
      type: "select",
      options: [
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
      ],
    },
  ],
  rules: [
    {
      when: { field: "urgency", value: "high" },
      then: { effect: "require", target: "phone" },
    },
    {
      when: { field: "urgency", value: "low" },
      then: { effect: "hide", target: "phone" },
    },
  ],
  schema: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    subject: z.string().optional(),
    message: z.string().min(1, "Message is required"),
    urgency: z.enum(["low", "medium", "high"]).optional(),
  }),
};

export const accidentReportModel: ModelDefinition = {
  id: "accidentReport",
  label: "Accident Report",
  description: "Vehicle accident and incident reporting form",
  useCases: [
    "accident",
    "crash",
    "insurance claim",
    "incident report",
    "vehicle damage",
  ],
  fields: [
    {
      id: "incidentDate",
      label: "Incident Date",
      type: "date",
      required: true,
    },
    {
      id: "location",
      label: "Location",
      type: "text",
      placeholder: "Address or intersection",
      required: true,
    },
    {
      id: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Describe what happened",
      required: true,
    },
    {
      id: "injured",
      label: "Were there injuries?",
      type: "boolean",
    },
    {
      id: "severity",
      label: "Injury Severity",
      type: "select",
      options: [
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
        { label: "Critical", value: "critical" },
      ],
    },
    {
      id: "vehicleCount",
      label: "Number of Vehicles",
      type: "number",
    },
  ],
  rules: [
    {
      when: { field: "injured", value: false },
      then: { effect: "hide", target: "severity" },
    },
    {
      when: { field: "injured", value: true },
      then: { effect: "require", target: "severity" },
    },
  ],
  schema: z.object({
    incidentDate: z.string().min(1, "Incident date is required"),
    location: z.string().min(1, "Location is required"),
    description: z.string().min(1, "Description is required"),
    injured: z.boolean().optional(),
    severity: z.enum(["low", "medium", "high", "critical"]).optional(),
    vehicleCount: z.number().optional(),
  }),
};
