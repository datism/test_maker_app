This is a web application for creating and managing tests. It provides a simple and intuitive interface for creating different types of questions and organizing them into projects.

## Features

*   **Project Management:** Create and manage different projects or tests.
*   **Question Wizards:** Step-by-step guides to create various types of questions, including:
    *   Multiple Choice
    *   Fill-in-the-Blank
    *   Reading Comprehension
    *   Writing
*   **Test Preview:** Ability to see what the generated test will look like.
*   **Export Options:** Export tests to DOCX and test's answer to XLSX formats.
*   **Rich Text Editing:** A text editor for formatting question content.

## Getting Started

### Prerequisites

*   Node.js and npm (or yarn) installed on your machine.

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd test-maker-app
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the Application

To start the development server, run the following command:

```bash
npm run dev
```

This will start the application in development mode and open it in your default browser at `http://localhost:5173`.

### Building the Application

To create a production build of the application, run the following command:

```bash
npm run build
```

This will create a `dist` directory with the production-ready files.

### Linting

To lint the code, run the following command:

```bash
npm run lint
```