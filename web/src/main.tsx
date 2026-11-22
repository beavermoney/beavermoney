import { startApplication } from './lib/start-application'

// Keep this entry dependency-free: the HTML loading surface can paint while
// Vite loads the application and its stylesheet in parallel.
void startApplication(() => import('./app'))
