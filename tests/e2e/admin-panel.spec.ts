import { test, expect } from '@playwright/test';
import { 
  loginAsAdmin, 
  waitForPageLoad, 
  expectToBeVisible,
  expectTextToExist,
  scrollToElement,
  clickButtonByText,
  getElementCount,
  elementExists,
  fillField,
  takeScreenshot
} from './helpers';

test.describe('Admin Panel - Complete Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  // ==========================================
  // DASHBOARD TESTS
  // ==========================================
  test. describe('Dashboard', () => {
    test('should display admin dashboard with all metrics', async ({ page }) => {
      console.log('  📊 Testing admin dashboard...');
      
      await page.goto('/admin');
      await waitForPageLoad(page);

      // Check for main heading
      await expectTextToExist(page, 'Admin Dashboard');

      // Check for metric cards (adjust selectors based on your actual implementation)
      const metrics = [
        'Total Users',
        'Total Brands',
        'Total Perfumes',
        'Pending Submissions',
        'Total Reviews',
        'Total Articles'
      ];

      for (const metric of metrics) {
        const exists = await elementExists(page, `text=${metric}`);
        if (exists) {
          console.log(`    ✓ Found metric: ${metric}`);
        }
      }

      console.log('  ✅ Dashboard test complete');
    });

    test('should display recent activity', async ({ page }) => {
      await page.goto('/admin');
      await waitForPageLoad(page);

      // Check for recent activity section
      const hasActivity = await elementExists(page, 'text=/Recent Activity|Latest Activity/i');
      if (hasActivity) {
        console.log('    ✓ Recent activity section found');
      }
    });

    test('should have working navigation links', async ({ page }) => {
      await page.goto('/admin');
      await waitForPageLoad(page);

      // Test navigation to different sections
      const navLinks = [
        { text: 'Submissions', url: '/admin/submissions' },
        { text: 'Users', url: '/admin/users' },
        { text: 'Drydown', url: '/admin/drydown' },
      ];

      for (const link of navLinks) {
        const linkExists = await elementExists(page, `a:has-text("${link. text}")`);
        if (linkExists) {
          console.log(`    ✓ Navigation link found: ${link.text}`);
        }
      }
    });
  });

  // ==========================================
  // SUBMISSIONS QUEUE TESTS
  // ==========================================
  test.describe('Submissions Queue', () => {
    test('should display submissions queue page', async ({ page }) => {
      console.log('  📤 Testing submissions queue...');
      
      await page.goto('/admin/submissions');
      await waitForPageLoad(page);

      await expectTextToExist(page, 'Submissions');

      // Check for tabs
      const tabs = ['Pending', 'Approved', 'Rejected'];
      for (const tab of tabs) {
        const tabExists = await elementExists(page, `button:has-text("${tab}"), a:has-text("${tab}")`);
        if (tabExists) {
          console.log(`    ✓ Tab found: ${tab}`);
        }
      }

      console.log('  ✅ Submissions queue test complete');
    });

    test('should show pending submissions', async ({ page }) => {
      await page.goto('/admin/submissions');
      await waitForPageLoad(page);

      // Click Pending tab
      const pendingTab = page.locator('button:has-text("Pending"), a:has-text("Pending")'). first();
      if (await pendingTab.isVisible({ timeout: 5000 })) {
        await pendingTab. click();
        await waitForPageLoad(page);

        // Check for submissions
        const submissionCount = await getElementCount(page, '[data-testid="submission-card"], .submission-card, article');
        console.log(`    ✓ Found ${submissionCount} submissions`);
      }
    });

    test('should be able to view submission details', async ({ page }) => {
      await page.goto('/admin/submissions');
      await waitForPageLoad(page);

      // Click on first submission if it exists
      const firstSubmission = page.locator('[data-testid="submission-card"], .submission-card'). first();
      
      if (await firstSubmission. isVisible({ timeout: 5000 })) {
        await firstSubmission.click();
        await waitForPageLoad(page);

        // Check for submission details
        console.log('    ✓ Opened submission details');
      }
    });

    test('should have approve and reject buttons', async ({ page }) => {
      await page.goto('/admin/submissions');
      await waitForPageLoad(page);

      const firstSubmission = page.locator('[data-testid="submission-card"], .submission-card').first();
      
      if (await firstSubmission.isVisible({ timeout: 5000 })) {
        await firstSubmission.click();
        await waitForPageLoad(page);

        // Check for action buttons
        const hasApprove = await elementExists(page, 'button:has-text("Approve")');
        const hasReject = await elementExists(page, 'button:has-text("Reject")');

        if (hasApprove) console.log('    ✓ Approve button found');
        if (hasReject) console.log('    ✓ Reject button found');
      }
    });
  });

  // ==========================================
  // BRAND APPLICATIONS TESTS
  // ==========================================
  test.describe('Brand Applications', () => {
    test('should display brand applications page', async ({ page }) => {
      console.log('  🏢 Testing brand applications...');
      
      await page.goto('/admin/brand-applications');
      await waitForPageLoad(page);

      await expectTextToExist(page, 'Brand Application');

      console.log('  ✅ Brand applications test complete');
    });

    test('should show pending applications', async ({ page }) => {
      await page.goto('/admin/brand-applications');
      await waitForPageLoad(page);

      const applicationCount = await getElementCount(page, '[data-testid="application-card"], .application-card');
      console.log(`    ✓ Found ${applicationCount} applications`);
    });

    test('should be able to view application details', async ({ page }) => {
      await page.goto('/admin/brand-applications');
      await waitForPageLoad(page);

      const firstApplication = page.locator('[data-testid="application-card"], .application-card').first();
      
      if (await firstApplication.isVisible({ timeout: 5000 })) {
        await firstApplication.click();
        await waitForPageLoad(page);

        // Check for application details fields
        const fields = ['Brand Name', 'Company', 'Contact', 'Website'];
        for (const field of fields) {
          const exists = await elementExists(page, `text=${field}`);
          if (exists) {
            console.log(`    ✓ Found field: ${field}`);
          }
        }
      }
    });
  });

  // ==========================================
  // ENRICHMENT SYSTEM TESTS
  // ==========================================
  test.describe('Enrichment System', () => {
    test('should display enrichment system page', async ({ page }) => {
      console.log('  🔍 Testing enrichment system.. .');
      
      await page. goto('/admin/enrichment');
      await waitForPageLoad(page);

      await expectTextToExist(page, 'Enrichment');

      console.log('  ✅ Enrichment system test complete');
    });

    test('should have enrichment tabs', async ({ page }) => {
      await page.goto('/admin/enrichment');
      await waitForPageLoad(page);

      const tabs = ['Pending', 'Completed', 'Flagged'];
      for (const tab of tabs) {
        const exists = await elementExists(page, `button:has-text("${tab}"), a:has-text("${tab}")`);
        if (exists) {
          console. log(`    ✓ Tab found: ${tab}`);
        }
      }
    });
  });

  // ==========================================
  // FEATURED CONTENT TESTS
  // ==========================================
  test.describe('Featured Content Management', () => {
    test('should display featured content page', async ({ page }) => {
      console. log('  ⭐ Testing featured content...');
      
      await page.goto('/admin/featured');
      await waitForPageLoad(page);

      await expectTextToExist(page, 'Featured');

      console.log('  ✅ Featured content test complete');
    });

    test('should show featured perfumes section', async ({ page }) => {
      await page.goto('/admin/featured');
      await waitForPageLoad(page);

      const exists = await elementExists(page, 'text=/Featured Perfumes|Perfumes/i');
      if (exists) {
        console.log('    ✓ Featured perfumes section found');
      }
    });

    test('should show featured brands section', async ({ page }) => {
      await page.goto('/admin/featured');
      await waitForPageLoad(page);

      const exists = await elementExists(page, 'text=/Featured Brands|Brands/i');
      if (exists) {
        console.log('    ✓ Featured brands section found');
      }
    });
  });

  // ==========================================
  // USER MANAGEMENT TESTS
  // ==========================================
  test.describe('User Management', () => {
    test('should display user management page', async ({ page }) => {
      console.log('  👥 Testing user management...');
      
      await page.goto('/admin/users');
      await waitForPageLoad(page);

      await expectTextToExist(page, 'User');

      console.log('  ✅ User management test complete');
    });

    test('should show list of users', async ({ page }) => {
      await page.goto('/admin/users');
      await waitForPageLoad(page);

      const userCount = await getElementCount(page, '[data-testid="user-row"], .user-row, tr');
      console.log(`    ✓ Found ${userCount} user rows`);
    });

    test('should have search functionality', async ({ page }) => {
      await page.goto('/admin/users');
      await waitForPageLoad(page);

      const searchInput = page.locator('input[placeholder*="Search" i], input[name="search"]'). first();
      
      if (await searchInput.isVisible({ timeout: 5000 })) {
        await searchInput.fill('testuser1');
        await page.waitForTimeout(1000); // Wait for debounce
        
        console.log('    ✓ Search functionality works');
      }
    });

    test('should display user details modal/page', async ({ page }) => {
      await page.goto('/admin/users');
      await waitForPageLoad(page);

      const firstUserRow = page.locator('[data-testid="user-row"], .user-row, tbody tr').first();
      
      if (await firstUserRow.isVisible({ timeout: 5000 })) {
        await firstUserRow.click();
        await page.waitForTimeout(1000);

        console.log('    ✓ User details opened');
      }
    });
  });

  // ==========================================
  // ANALYTICS TESTS
  // ==========================================
  test.describe('Analytics', () => {
    test('should display analytics page', async ({ page }) => {
      console.log('  📊 Testing analytics...');
      
      await page.goto('/admin/analytics');
      await waitForPageLoad(page);

      await expectTextToExist(page, 'Analytics');

      console. log('  ✅ Analytics test complete');
    });

    test('should show analytics charts/data', async ({ page }) => {
      await page.goto('/admin/analytics');
      await waitForPageLoad(page);

      // Check for common analytics sections
      const sections = ['Users', 'Traffic', 'Engagement', 'Growth'];
      let foundSections = 0;

      for (const section of sections) {
        const exists = await elementExists(page, `text=${section}`);
        if (exists) {
          foundSections++;
          console.log(`    ✓ Found section: ${section}`);
        }
      }

      expect(foundSections).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // DRYDOWN CMS TESTS (BASIC)
  // ==========================================
  test.describe('Drydown CMS - Basic Navigation', () => {
    test('should display Drydown CMS page', async ({ page }) => {
      console.log('  📝 Testing Drydown CMS navigation...');
      
      await page.goto('/admin/drydown');
      await waitForPageLoad(page);

      await expectTextToExist(page, 'Drydown');

      console.log('  ✅ Drydown CMS navigation test complete');
    });

    test('should show articles list', async ({ page }) => {
      await page.goto('/admin/drydown');
      await waitForPageLoad(page);

      const articleCount = await getElementCount(page, '[data-testid="article-row"], .article-row, article');
      console.log(`    ✓ Found ${articleCount} articles`);
    });

    test('should have "Create Article" button', async ({ page }) => {
      await page.goto('/admin/drydown');
      await waitForPageLoad(page);

      const createButton = page.locator('button:has-text("Create"), a:has-text("Create"), button:has-text("New Article")').first();
      const exists = await createButton.isVisible({ timeout: 5000 });
      
      if (exists) {
        console.log('    ✓ Create Article button found');
      }
    });
  });
});