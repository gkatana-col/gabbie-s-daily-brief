# Gabbie's Daily Brief

Help me build an AI-powered app using Lovable AI. Create a mobile-first AI personal briefing web app called Gabbie Brief.



The app should feel like a polished premium personal assistant inspired by the concept of Samsung Now Brief, but it must have its own original visual identity and UX.



CORE REQUIREMENTS



Build the application as a responsive PWA-style web app, optimized primarily for Android phones.



Default language: Bulgarian (bg-BG).



The application must support:



- 🇧🇬 Bulgarian

- 🇬🇧 English



Create a proper internationalization system from the beginning. Do NOT hard-code interface strings directly into components.



Language settings:



- Bulgarian

- English

- Automatic



Default to Bulgarian.



When Bulgarian is selected:



- use natural contemporary Bulgarian;

- use correct Bulgarian grammar;

- use informal "ти" style;

- use Bulgarian date/time formatting;

- never produce literal machine-like translations;

- do not unnecessarily mix Bulgarian and English.



The user must be able to switch languages from Settings without reloading the application.



MAIN SCREEN



Create a beautiful mobile dashboard with:



1. Greeting

2. Current date

3. AI-generated daily summary

4. Today's priorities

5. Calendar preview

6. Weather preview

7. News preview

8. Personal focus/insight

9. Evening recap section



For the first version, use realistic mock data so the complete UI can be demonstrated before external APIs are connected.



Example Bulgarian content:



"Добър ден, Gabbie ☀️"



"Ето какво е важно за теб днес."



"Днес имаш сравнително спокоен график. Следобедът ти е подходящ за фокусирана работа."



NAVIGATION



Create bottom navigation:



- Начало

- Днес

- Новини

- Календар

- Настройки



Use icons and labels.



VISUAL STYLE



Design language:



- elegant

- minimal

- intelligent

- premium

- calm

- slightly futuristic

- professional rather than playful



Use:



- warm off-white / very light beige background

- subtle green accents

- restrained blue-gray secondary accents

- glassmorphism only where useful

- rounded cards

- soft shadows

- excellent typography

- generous spacing



Avoid:



- excessive gradients

- neon colors

- generic AI purple

- clutter

- excessive animations



The application should feel appropriate for an adult professional and university student.



HOME SCREEN CARD STRUCTURE



Create reusable components:



- GreetingCard

- DailySummaryCard

- PriorityCard

- CalendarCard

- WeatherCard

- NewsCard

- InsightCard

- EveningRecapCard



Each card must be independently reusable and responsive.



AI ARCHITECTURE



Create a dedicated service/module called:



"briefingEngine"



It should eventually receive structured information from:



- calendar

- weather

- news

- tasks

- user preferences



and produce a structured daily briefing.



For now, create mock structured input and mock AI output.



Use a clear separation between:



1. raw data

2. AI processing

3. UI presentation



Do not put AI logic directly inside UI components.



DATA MODEL



Prepare the application architecture for:



User:



- name

- preferredLanguage

- briefingLanguage

- timezone

- notificationPreferences



Briefing:



- date

- greeting

- summary

- priorities

- calendarItems

- weather

- news

- insight

- eveningRecap



SETTINGS



Create a Settings page with:



Language



- Automatic

- Български

- English



Briefing language



- Same as interface

- Български

- English



Theme



- System

- Light

- Dark



Notifications



- Morning briefing

- Important updates

- Evening recap



IMPORTANT



Do not implement external APIs yet.



Do not implement authentication yet.



Do not implement payments yet.



Do not over-engineer the backend.



First create a clean, working, polished foundation that can later receive real integrations.



Make the app fully responsive and test the mobile layout carefully.



Use TypeScript and a clean component architecture.



After implementation, check the entire application for:



- broken navigation

- untranslated strings

- layout overflow

- poor mobile spacing

- inconsistent typography

- inaccessible buttons

- console errors



Do not remove existing functionality when adding new functionality.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/235d60c0-3cfd-4adb-a826-a80f3ac11a2b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
