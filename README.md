# Rocky Rehab

A personalized rehabilitation tracking application for C4/C5 nerve injuries, designed to help patients monitor progress, follow exercise plans, and access recovery resources.

## Features

- **Rehabilitation Plan**: View and track personalized exercise regimens
- **Progress Logging**: Record exercise completion, pain levels, and difficulty
- **Analytics Dashboard**: Visualize recovery progress with charts and trends
- **Resource Center**: Access curated educational materials for recovery
- **AI Assistant**: Get guidance and answer questions about rehabilitation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/rocky-rehab.git
   cd rocky-rehab
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Data Structure

The application uses JSON files stored in the `public/data` directory:

- `rehab-plan.json`: Contains exercise definitions
- `progress-logs.json`: Stores exercise completion records
- `resources.json`: Educational articles and resources

## Technology Stack

- **Frontend**: React, Next.js 14, Tailwind CSS
- **UI Components**: ShadCN UI
- **Data Visualization**: Recharts
- **API Routes**: Next.js API Routes

## License

[MIT](LICENSE)

## Acknowledgments

- Created for patients with C4/C5 nerve injuries to track their rehabilitation journey
- Inspired by modern healthcare applications that prioritize user experience
