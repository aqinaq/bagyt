import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests',fullyParallel:true,workers:2,reporter:'list',use:{baseURL:process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4178',headless:true},projects:[{name:'desktop',use:{viewport:{width:1440,height:1000}}},{name:'mobile',use:{viewport:{width:360,height:800},isMobile:true,hasTouch:true}}]});
