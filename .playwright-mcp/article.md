One of the most requested tutorials we are asked for is how to integrate Tailwind CSS, the still-contentious CSS utility framework that warrants no introduction, into the Payload admin panel.

As of 3.0, the Payload admin panel integrates directly into your Next.js App Router project. This lends us the flexibility and some of the integrations Next.js already comes with, making the addition of Tailwind or other libraries easier than in previous versions.

In Tailwind v4 it's no longer necessary to run the tailwind init command so we've updated these steps accordingly.

Setup
Step 1 is to have Payload installed using this command:

npx create-payload-app
From here on we refer to the official installation guide, so let's add the Tailwind dependencies.

npm install tailwindcss @tailwindcss/postcss postcss
Create a postcss.config.js file in the root of your project and populate it with:

const config = {
plugins: {
"@tailwindcss/postcss": {},
},
};
export default config;
Lastly we need to import Tailwind into a global stylesheet for our frontend, let's create a globals.css file next to our layout in (app).

@import "tailwindcss";
And we need to make sure our globals.css file is imported in our layout.tsx component.

import { ReactNode } from 'react'

type LayoutProps = {
children: ReactNode
}

import './globals.css'

const Layout = ({ children }: LayoutProps) => {
return (
<html>
<body>
{children}
</body>
</html>
)
}

export default Layout
From here on, you can use it in your frontend as you need, but we're also going to setup a custom component for Payload and use it there.

Usage in the admin panel and custom components
We're going to setup a simple UI field in Payload but any custom component will work; in our collection let's add the field.

import AlertBox from '@/components/AlertBox'
import type { CollectionConfig } from 'payload/types'

export const Posts: CollectionConfig = {Code feature
slug: 'posts',
admin: {
useAsTitle: 'title',
},
fields: [
{
name: 'title',
type: 'text',
},
{
name: 'alertBox',
type: 'ui',
admin: {
components: {
Field: AlertBox,Code feature
},
},
},
],
}
And in /components/AlertBox.tsx we'll create a simple placeholder component.

import React from 'react'

const AlertBox: React.FC = () => {
return <div className="p-4 border-4 border-solid border-yellow-100">Please add a title.</div>
}

export default AlertBox
You won't be seeing the styles updated just yet as we need to add the Tailwind directives to our admin panel's CSS as well. So locate custom.scss in your (payload) route group and we'll add the same @tailwind directives in there

// @tailwind base; <- do not addCode feature
@tailwind components;
@tailwind utilities;
Do not add the base styles here as they contain a lot of style resets that may interfere with the admin panel.

And now you can use Tailwind in any of your components! Open your admin panel and go to the collection using your AlertBox UI field to see it in action.

Bonus: shadcn/ui
Shadcn/ui is a library of components to be installed and used locally and it uses Tailwind CSS so please make sure it's working before running the following command

npx shadcn-ui@latest init
This will take you through the installation steps, and pretty much all aspects can be left as the default however you need to make sure that the globals.css path is configured to your actual file's inside (app).

This will generate and override certain files for you including the tailwind.config.js and globals.css files.

Now let's add the Inter font for shadcn but you can replace this with any font that you want. Our layout.tsx in (app) should look something like this

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Inter as FontSans } from 'next/font/google'

type LayoutProps = {
children: ReactNode
}

import './globals.css'

const fontSans = FontSans({
subsets: ['latin'],
variable: '--font-sans',
})

const Layout = ({ children }: LayoutProps) => {
return (
<html>
<body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
{children}
</body>
</html>
)
}

export default Layout
Since the installation process sets up everything for us, we need to make a few more adjustments to work with Payload's admin panel.

In tailwind.config.js we need to adjust the dark mode selector to include data-theme which is what Payload uses instead of a class.

darkMode: ['selector', '[data-theme="dark"]', '.dark'],
And in (payload)/custom.scss we need to copy over the generated values for root: CSS variables so that the shadcn components can utilise the styles out of the box.

@tailwind components;
@tailwind utilities;

:root {
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;

--card: 0 0% 100%;
--card-foreground: 222.2 84% 4.9%;

--popover: 0 0% 100%;
--popover-foreground: 222.2 84% 4.9%;

--primary: 222.2 47.4% 11.2%;
--primary-foreground: 210 40% 98%;

--secondary: 210 40% 96.1%;
--secondary-foreground: 222.2 47.4% 11.2%;

--muted: 210 40% 96.1%;
--muted-foreground: 215.4 16.3% 46.9%;

--accent: 210 40% 96.1%;
--accent-foreground: 222.2 47.4% 11.2%;

--destructive: 0 84.2% 60.2%;
--destructive-foreground: 210 40% 98%;

--border: 214.3 31.8% 91.4%;
--input: 214.3 31.8% 91.4%;
--ring: 222.2 84% 4.9%;

--radius: 0.5rem;
}

[data-theme='dark'] {
--background: 222.2 84% 4.9%;
--foreground: 210 40% 98%;

--card: 222.2 84% 4.9%;
--card-foreground: 210 40% 98%;

--popover: 222.2 84% 4.9%;
--popover-foreground: 210 40% 98%;

--primary: 210 40% 98%;
--primary-foreground: 222.2 47.4% 11.2%;

--secondary: 217.2 32.6% 17.5%;
--secondary-foreground: 210 40% 98%;

--muted: 217.2 32.6% 17.5%;
--muted-foreground: 215 20.2% 65.1%;

--accent: 217.2 32.6% 17.5%;
--accent-foreground: 210 40% 98%;

--destructive: 0 62.8% 30.6%;
--destructive-foreground: 210 40% 98%;

--border: 217.2 32.6% 17.5%;
--input: 217.2 32.6% 17.5%;
--ring: 212.7 26.8% 83.9%;
}
We do this by copying the generated code from globals.css but note that we won't be using base here so we can remove the @layer base directives and we need to replace the .dark selector with a [data-theme='dark'] selector for the admin panel.

That's a lot of code. o please check out the example repo for a reference.

Now we can add the alert component, this will install it in a ui directory under components

npx shadcn-ui@latest add alert
And we can go back to our AlertBox component and let's use this new alert instead. Import the dependencies

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
And we'll use it as is.

<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    Please add an appropriate title.
  </AlertDescription>
</Alert>
the final component for AlertBox will look like this:

import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const AlertBox: React.FC = () => {
return (
<Alert>
<AlertTitle>Heads up!</AlertTitle>
<AlertDescription>Please add an appropriate title.</AlertDescription>
</Alert>
)
}

export default AlertBox
And that should be it, you've now got the full power of shadcn components in Payload, follow along with the full example.

Combine it with our React hooks to read and manipulate data in your fields!

Like what we're doing? Star us on Github!
