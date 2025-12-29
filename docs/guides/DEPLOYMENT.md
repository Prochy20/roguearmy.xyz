# Deployment Guide

## Vercel Deployment

### Prerequisites
- Vercel account
- MongoDB Atlas cluster
- Git repository (GitHub/GitLab/Bitbucket)

### Step 1: MongoDB Atlas Setup

1. Create cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create database user with read/write access
3. Whitelist IP addresses (or allow from anywhere: `0.0.0.0/0`)
4. Get connection string:
   ```
   mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/<database>?retryWrites=true&w=majority
   ```

### Step 2: Vercel Project Setup

1. Go to [vercel.com](https://vercel.com)
2. Import Git repository
3. Framework: Next.js (auto-detected)
4. Root Directory: `./` (or subdirectory if monorepo)

### Step 3: Environment Variables

Add in Vercel dashboard (Settings → Environment Variables):

| Variable | Value | Environments |
|----------|-------|--------------|
| `DATABASE_URL` | MongoDB Atlas connection string | All |
| `PAYLOAD_SECRET` | Random 32+ char string | All |
| `NEXT_PUBLIC_SERVER_URL` | `https://your-domain.vercel.app` | All |

Generate secret:
```bash
openssl rand -base64 32
```

### Step 4: Deploy

1. Push to main branch
2. Vercel auto-deploys
3. Check build logs for errors

### Build Configuration

Already configured in `next.config.mjs`:
```javascript
// Sharp is externalized for serverless
serverExternalPackages: ['sharp']
```

And in `package.json`:
```json
"build": "cross-env NODE_OPTIONS=\"--no-deprecation --max-old-space-size=8000\" next build"
```

## Custom Domain

1. Vercel Dashboard → Settings → Domains
2. Add domain
3. Configure DNS:
   - A record: `76.76.21.21`
   - CNAME: `cname.vercel-dns.com`
4. Update `NEXT_PUBLIC_SERVER_URL` to new domain

## Environment-Specific Settings

### Production
```bash
NEXT_PUBLIC_SERVER_URL=https://roguearmyga.com
DATABASE_URL=mongodb+srv://...production-db...
```

### Preview (PR deployments)
```bash
NEXT_PUBLIC_SERVER_URL=https://preview-xxx.vercel.app
DATABASE_URL=mongodb+srv://...staging-db...
```

## Monitoring

### Vercel Analytics
Already configured in layout:
```tsx
import { Analytics } from "@vercel/analytics/next"

<Analytics />
```

### Logs
Vercel Dashboard → Deployments → Functions → Logs

### Runtime Logs
```bash
vercel logs
```

## Troubleshooting

### Build Fails: Sharp

If Sharp fails to build:
1. Verify `serverExternalPackages: ['sharp']` in config
2. Check Node.js version matches engines

### 500 Error on Admin

1. Check `DATABASE_URL` is correct
2. Verify MongoDB Atlas IP whitelist
3. Check Vercel function logs

### Missing Environment Variables

Build will fail if required vars are missing. Verify:
- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `NEXT_PUBLIC_SERVER_URL`

### Slow Cold Starts

Serverless functions have cold start latency. Solutions:
- Edge runtime (where supported)
- Vercel Pro for faster functions
- Static generation for public pages

## Alternative Platforms

### Railway
1. Create project from Git
2. Add MongoDB plugin
3. Set environment variables
4. Deploy

### Render
1. Create Web Service
2. Connect repository
3. Build Command: `pnpm build`
4. Start Command: `pnpm start`
5. Add environment variables

### Self-Hosted

#### Docker
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
```

#### PM2
```bash
pm2 start npm --name "rga-web" -- start
```

## Post-Deployment Checklist

- [ ] Site loads at production URL
- [ ] Admin panel accessible
- [ ] Can create/edit content
- [ ] Images upload correctly
- [ ] All animations work
- [ ] Mobile responsive
- [ ] SEO meta tags present
- [ ] Analytics tracking
- [ ] SSL certificate active
