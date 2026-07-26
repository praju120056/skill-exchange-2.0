import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const picsDir = path.join(__dirname, '../pics');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function clickButtonWithText(page, text) {
    const handle = await page.evaluateHandle((txt) => {
        const btns = Array.from(document.querySelectorAll('button, a'));
        return btns.find(b => b.textContent && b.textContent.includes(txt));
    }, text);
    if (handle) {
        const el = handle.asElement();
        if (el) {
            await el.click();
            return true;
        }
    }
    return false;
}

async function capture() {
    console.log('Launching browser to capture screenshots...');
    const browser = await puppeteer.launch({
        headless: 'new',
        defaultViewport: { width: 1440, height: 900 }
    });

    const page = await browser.newPage();

    try {
        // 1. Login page
        console.log('Capturing login.png...');
        await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
        await delay(1000);
        await page.screenshot({ path: path.join(picsDir, 'login.png') });

        // Perform login
        console.log('Logging in as Emma Thompson...');
        await page.type('input[type="email"]', 'emma.thompson@student.edu');
        await page.type('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        await delay(2000);

        // 2. Dashboard 1 (Teach tab)
        console.log('Capturing dashboard_1.png...');
        await page.screenshot({ path: path.join(picsDir, 'dashboard_1.png') });

        // 3. Dashboard 2 (Add Skill panel open)
        console.log('Capturing dashboard_2.png...');
        await clickButtonWithText(page, 'Add Skill');
        await delay(1000);
        await page.screenshot({ path: path.join(picsDir, 'dashboard_2.png') });

        // 4. AI Mentor Modal (ai_response.png)
        console.log('Capturing ai_response.png...');
        // Open AI mentor modal on one of the skills
        const aiMentorBtn = await page.evaluateHandle(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            return btns.find(b => b.title && b.title.includes('AI Mentor'));
        });
        if (aiMentorBtn && aiMentorBtn.asElement()) {
            await aiMentorBtn.asElement().click();
        } else {
            // fallback click on first AI mentor SVG button
            await clickButtonWithText(page, 'AI');
        }
        await delay(1000);

        // Fill AI question
        const textarea = await page.$('textarea');
        if (textarea) {
            await textarea.type('What are the top 3 projects to build to master React?');
            await clickButtonWithText(page, 'Ask');
            await delay(3500); // Wait for response
        }
        await page.screenshot({ path: path.join(picsDir, 'ai_response.png') });

        // Close modal
        await page.keyboard.press('Escape');
        await delay(800);

        // 5. Matched Screen (matched_user.png)
        console.log('Capturing matched_user.png...');
        await page.goto('http://localhost:3000/matches', { waitUntil: 'networkidle0' });
        await delay(2000);
        await page.screenshot({ path: path.join(picsDir, 'matched_user.png') });

        // 6. Matched User Info (matched_user_info.png)
        console.log('Capturing matched_user_info.png...');
        // Click on first match card button
        const viewBtn = await page.evaluateHandle(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            return btns.find(b => b.textContent && (b.textContent.includes('View') || b.textContent.includes('Details') || b.textContent.includes('Connect')));
        });
        if (viewBtn && viewBtn.asElement()) {
            await viewBtn.asElement().click();
        } else {
            const card = await page.$('.glass-card');
            if (card) await card.click();
        }
        await delay(1000);
        await page.screenshot({ path: path.join(picsDir, 'matched_user_info.png') });

        // Close modal
        await page.keyboard.press('Escape');
        await delay(800);

        // 7. Messages / Chat Screen (messages_chat.png & messages.png)
        console.log('Capturing messages_chat.png...');
        await page.goto('http://localhost:3000/messages', { waitUntil: 'networkidle0' });
        await delay(2000);

        // Click first conversation with Liam
        const liamConv = await page.evaluateHandle(() => {
            const divs = Array.from(document.querySelectorAll('div, button'));
            return divs.find(d => d.textContent && d.textContent.includes('Liam Anderson'));
        });
        if (liamConv && liamConv.asElement()) {
            await liamConv.asElement().click();
        }
        await delay(1000);
        await page.screenshot({ path: path.join(picsDir, 'messages_chat.png') });
        await page.screenshot({ path: path.join(picsDir, 'messages.png') });

        // 8. Profile Screen (profile.png)
        console.log('Capturing profile.png...');
        await page.goto('http://localhost:3000/profile', { waitUntil: 'networkidle0' });
        await delay(2000);
        await page.screenshot({ path: path.join(picsDir, 'profile.png') });

        console.log('✅ ALL SCREENSHOTS SUCCESSFULLY CAPTURED & SAVED TO PICS FOLDER!');
    } catch (err) {
        console.error('Error during screenshot capture:', err);
    } finally {
        await browser.close();
    }
}

capture();
