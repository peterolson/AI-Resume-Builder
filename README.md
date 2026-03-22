# AI Resume Builder

A full-stack web app that generates a professional resume from your information and uses AI to improve it instantly.

## Features

- Fill in your details and generate a formatted resume in seconds
- Choose between two professional resume designs
- AI-powered improvement using OpenAI GPT to make your resume sound more professional
- Download your resume as a PDF

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **AI:** OpenAI GPT API
- **PDF Export:** html2pdf.js

## Getting Started

### Prerequisites

- Node.js installed on your machine
- An OpenAI API key from [platform.openai.com](https://platform.openai.com)

### Installation

1. Clone the repository
```bash
   git clone https://github.com/Aziza526/AI-Resume-Builder.git
   cd AI-Resume-Builder
```

2. Install dependencies
```bash
   npm install
```

3. Create a `.env` file in the root folder and add your OpenAI API key
```
   OPENAI_API_KEY=your_api_key_here
```

4. Start the server
```bash
   node server.js
```

5. Open your browser and go to `http://localhost:3000`

## Usage

1. Fill in your full name, email, education, work experience and skills
2. Choose a resume design
3. Click **Build Resume** to generate your resume
4. Click **AI Improve** to let AI enhance the language and formatting
5. Click **Download as PDF** to save your resume

## Security

- User inputs are sanitized to prevent XSS attacks
- API endpoint is rate limited to 10 requests per 15 minutes
- API key is stored securely in environment variables and never exposed to the frontend

## License

MIT
