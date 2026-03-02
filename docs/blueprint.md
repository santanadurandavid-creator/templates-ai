# **App Name**: Studio Genie

## Core Features:

- Quick Templates Grid: Display a grid of editable, reordable, and deletable quick templates. Each button copies text to clipboard.
- Search and Filters: Implement a real-time search bar and category selector to filter templates.
- Template List: Display templates as cards with title, category, content preview, and actions (copy, edit, delete, rephrase with AI).
- Top Used Templates: Automatically track and display the most used templates in a horizontal scrollable bar.
- AI Template Generation: Open a modal to generate a new, empathetic template based on the provided context, using a Genkit AI tool.
- Rephrase with AI: Integrate Genkit to rephrase existing templates, improving their tone and style.
- Import/Export Templates: Implement buttons to export all data (templates, logs, settings, history) to a JSON file, and to import data from a JSON file.
- Link Manager: Allow agents to save, edit, and open frequent links to forms/sheets, persisting data in local storage.

## Style Guidelines:

- Primary color: Soft blue (#A0D2EB) for a calming, supportive feel.
- Background color: Light blue (#EBF4FA), a desaturated shade of the primary.
- Accent color: Pale lavender (#D0B4DE) to add a contrasting touch that's both professional and friendly.
- Body and headline font: 'PT Sans', a modern yet humanist sans-serif.
- Use Lucide React icons for a consistent and clean look throughout the app.
- Mobile-first design with a bottom dock or tab navigation for main sections.
- Subtle toast notifications to provide feedback on actions like copying or saving.