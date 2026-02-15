# TimapWeb

A modern web application for finding and coordinating sports matches in real-time. Built with React, TypeScript, Vite, and Supabase.

## ✨ Features

- **Real-time Match Discovery**: Browse and discover available sports matches in your area
- **Instant Updates**: Real-time synchronization of match status and participant information using Supabase subscriptions
- **Easy Match Creation**: Create and customize new matches with detailed information
- **Quick Join System**: Join existing matches with a single click
- **Invite Links**: Share match invitations via URL parameters for seamless onboarding
- **Player Statistics**: View live match statistics and participant information
- **Responsive Design**: Dark-themed UI with a modern, intuitive interface
- **Multi-page Navigation**: Navigate between home, match details, about, and support pages

## 🛠 Tech Stack

- **Frontend Framework**: React 18.3.1
- **Language**: TypeScript 5.5.3
- **Build Tool**: Vite 5.4.2
- **Styling**: Tailwind CSS 3.4.1
- **UI Components**: Lucide React (icons)
- **Backend & Database**: Supabase 2.57.4
- **Development Tools**: ESLint, PostCSS
- **Runtime**: Node.js

## 📁 Project Structure

```
TimapWeb/
├── src/
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # Application entry point
│   ├── components/             # Reusable React components
│   ├── pages/                  # Page components
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # Utility functions
│   ├── styles/                 # CSS and styling files
│   └── types/                  # TypeScript type definitions
├── supabase/                   # Supabase configuration
├── .bolt/                      # Bolt framework configuration
├── public/                     # Static assets
├── index.html                  # HTML entry point
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── eslint.config.js            # ESLint configuration
├── postcss.config.js           # PostCSS configuration
├── package.json                # Project dependencies
└── README.md                   # This file
```

## 💻 Usage

### Creating a Match

1. Click the **"Create Match"** button on the home page
2. Fill in the match details:
   - Sport type
   - Location
   - Time and date
   - Number of players needed
   - Additional description
3. Click **Submit** to create the match
4. The match will appear in the real-time matches list

### Joining a Match

1. Browse available matches on the home page
2. Click on a match to view its details
3. Click **"Join Match"** button
4. Confirm your participation
5. You'll be added to the participants list

### Invite Links

Share matches with others using invite links:

```
https://timapweb.com/?matchCode=ABC123
```

When someone opens an invite link:
- The match details modal automatically opens
- They can view the match information
- They can join directly with one click


## 📊 Project Status

- **Created**: January 22, 2026
- **Last Updated**: February 8, 2026
- **Repository Size**: 530 KB
- **Language**: TypeScript

---

**Built with ❤️ by ferzap20**

For more information, visit the [GitHub repository](https://github.com/ferzap20/TimapWeb)

