import { Page, expect } from '@playwright/test';

/**
 * Login as admin user
 */
export async function loginAsAdmin(page: Page) {
  console.log('  🔐 Logging in as admin...');
  
  try {
    await page.goto('/login');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForSelector('form, input[type="email"]', { timeout: 10000 });
    
    // Fill email field
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[id="email"]',
      'input[placeholder*="email" i]',
    ];
    
    let emailFilled = false;
    for (const selector of emailSelectors) {
      try {
        const emailInput = page.locator(selector).first();
        if (await emailInput.isVisible({ timeout: 2000 })) {
          await emailInput.fill('admin@fragview.com');
          emailFilled = true;
          console.log(`    ✓ Email filled using selector: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!emailFilled) {
      throw new Error('Could not find email input field');
    }
    
    // Fill password field
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[id="password"]',
      'input[placeholder*="password" i]',
    ];
    
    let passwordFilled = false;
    for (const selector of passwordSelectors) {
      try {
        const passwordInput = page.locator(selector).first();
        if (await passwordInput. isVisible({ timeout: 2000 })) {
          await passwordInput.fill('TestAdmin123$');
          passwordFilled = true;
          console.log(`    ✓ Password filled using selector: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!passwordFilled) {
      throw new Error('Could not find password input field');
    }
    
    await page.waitForTimeout(500);
    
    // Submit form
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Sign in")',
      'button:has-text("Log in")',
      'button:has-text("Login")',
      'input[type="submit"]',
      'form button[type="button"]:has-text("Sign")',
    ];
    
    let submitted = false;
    for (const selector of submitSelectors) {
      try {
        const submitButton = page.locator(selector). first();
        if (await submitButton.isVisible({ timeout: 2000 })) {
          console.log(`    ✓ Clicking submit button: ${selector}`);
          await submitButton.click();
          submitted = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!submitted) {
      console.log('    ⚠️  No submit button found, trying form.submit()');
      await page.evaluate(() => {
        const form = document.querySelector('form');
        if (form) {
          form.requestSubmit();
        }
      });
    }
    
    // Wait for navigation
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      await page.screenshot({ path: 'test-results/login-failed.png' });
      throw new Error(`Login failed - still on login page.  URL: ${currentUrl}`);
    }
    
    console.log('  ✅ Logged in as admin');
    
  } catch (error) {
    console.error('  ❌ Login failed:', error);
    await page.screenshot({ path: 'test-results/login-error.png', fullPage: true });
    throw error;
  }
}

/**
 * Login as regular test user
 */
export async function loginAsUser(page: Page, userNumber: number) {
  console.log(`  🔐 Logging in as testuser${userNumber}...`);
  
  try {
    await page.goto('/login');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page. waitForSelector('form, input[type="email"]', { timeout: 10000 });
    
    // Fill email
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill(`testuser${userNumber}@fragview. com`);
    
    // Fill password
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.fill('TestAdmin123$');
    
    await page. waitForTimeout(500);
    
    // Submit
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in")'). first();
    await submitButton. click();
    
    // Wait for navigation
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      throw new Error('Still on login page after submit');
    }
    
    console.log(`  ✅ Logged in as testuser${userNumber}`);
    
  } catch (error) {
    console.error(`  ❌ Login failed for testuser${userNumber}:`, error);
    await page.screenshot({ path: `test-results/login-error-user${userNumber}.png`, fullPage: true });
    throw error;
  }
}

/**
 * Logout current user
 */
export async function logout(page: Page) {
  console.log('  🚪 Logging out...');
  
  const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Log out"), a:has-text("Logout")');
  
  if (await logoutButton.isVisible({ timeout: 2000 })) {
    await logoutButton.click();
    await page.waitForTimeout(2000);
  }
  
  console.log('  ✅ Logged out');
}

/**
 * Wait for page to fully load
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: 15000 });
  await page.waitForTimeout(500);
}

/**
 * Check if element is visible
 */
export async function expectToBeVisible(page: Page, selector: string, timeout = 10000) {
  await expect(page.locator(selector). first()). toBeVisible({ timeout });
}

/**
 * Check if text exists on page
 */
export async function expectTextToExist(page: Page, text: string, timeout = 10000) {
  await expect(page. locator(`text=${text}`).first()).toBeVisible({ timeout });
}

/**
 * Click element and wait for navigation
 */
export async function clickAndWaitForNavigation(page: Page, selector: string) {
  await Promise.all([
    page.waitForNavigation({ timeout: 15000 }),
    page.click(selector)
  ]);
}

/**
 * Take screenshot with custom name
 */
export async function takeScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ 
    path: `test-results/screenshots/${name}-${timestamp}.png`, 
    fullPage: true 
  });
}

/**
 * Scroll to element
 */
export async function scrollToElement(page: Page, selector: string) {
  await page. locator(selector).first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
}

/**
 * Get element count
 */
export async function getElementCount(page: Page, selector: string): Promise<number> {
  return await page.locator(selector). count();
}

/**
 * Check if element exists (without throwing)
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  return await page.locator(selector). count() > 0;
}

/**
 * Wait for element to disappear
 */
export async function waitForElementToDisappear(page: Page, selector: string, timeout = 10000) {
  await expect(page.locator(selector).first()).toBeHidden({ timeout });
}

/**
 * Get text content of element
 */
export async function getTextContent(page: Page, selector: string): Promise<string> {
  const element = page.locator(selector). first();
  return (await element.textContent()) || '';
}

/**
 * Click button by text
 */
export async function clickButtonByText(page: Page, text: string) {
  await page.click(`button:has-text("${text}"), a:has-text("${text}")`);
}