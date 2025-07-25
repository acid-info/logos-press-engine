# Logos Press Engline

The repository for [press.logos.co](https://press.logos.co/) website.

**Tech Stacks**

- NextJS : React Framework

- [LSD](https://github.com/acid-info/lsd) : Design System

- Hookstate : State Management

- Emotion: CSS-in-JS

- [Strapi](https://strapi.io/) : CMS


## Environment Variables

Please check the environment values in `.env` located in the root directory.

```
SIMPLECAST_ACCESS_TOKEN=
REVALIDATE_WEBHOOK_TOKEN=
NEXT_PUBLIC_SITE_URL=https://press.logos.co
FATHOM_SITE_ID=
NODE_ENV=
LOG_LEVEL=
```

This is a template for `.env.local`, which is included in `.gitignore`.

To find the Simplecast access token, follow these steps on the Simplecast dashboard:

1. Click the gear button in the top-right corner.

2. Select `Private Apps` to acquire your JWT bearer token.


## How to Run Locally

1. Clone this repository
```bash
$ git clone https://github.com/acid-info/logos-press-engine.git
```

2. Install the dependencies:
```bash
$ yarn install
```

3. Start the development server:
```bash
$ yarn dev
```

4. Visit `http://localhost:3000` in your browser


## How to Run a Static Build (Production Build)

1. Generate static files for production:

```bash
$ yarn build
```

The static files will be created in the `build` directory.

2. Serve the static build:

```bash
$ yarn start
```

4. Visit `http://localhost:3000` in your browser


## CI/CD

- The `master` branch is automatically deployed to the production server (e.g., logos.co) through [CI](https://ci.infra.status.im)
- The `develop` branch is automatically deployed to the staging server (e.g., dev.logos.co) through [CI](https://ci.infra.status.im)


## Change Process

1. Create a new working branch from `develop`: `git checkout develop; git checkout -b my-changes`.

2. Make your changes, push them to the `origin`, and open a Pull Request against the `develop` branch.

3. After approval, merge the pull request, and verify the changes on the staging server (https://dev-press.logos.co/).

4. When ready to promote changes to the live website, create a pull request against the "master" branch, based on the "develop" branch.