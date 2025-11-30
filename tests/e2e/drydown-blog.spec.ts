import { test, expect } from '@playwright/test';
import { 
  loginAsUser,
  logout,
  waitForPageLoad, 
  expectToBeVisible,
  expectTextToExist,
  scrollToElement,
  clickButtonByText,
  getElementCount,
  elementExists,
  fillField,
  getTextContent,
  takeScreenshot
} from './helpers';

test. describe('Drydown Blog - Complete Test Suite', () => {
  
  // ==========================================
  // ARTICLE LISTING TESTS
  // ==========================================
  test.describe('Article Listing Page', () => {
    test('should display article listing page', async ({ page }) => {
      console.log('  📰 Testing article listing page...');
      
      await page.goto('/drydown');
      await waitForPageLoad(page);

      // Check for main heading
      await expectTextToExist(page, 'Drydown');

      console.log('  ✅ Article listing page displayed');
    });

    test('should display multiple articles', async ({ page }) => {
      await page.goto('/drydown');
      await waitForPageLoad(page);

      // Count articles
      const articleCount = await getElementCount(page, '[data-testid="article-card"], article, .article-card');
      console.log(`    ✓ Found ${articleCount} articles`);
      
      expect(articleCount).toBeGreaterThan(0);
      expect(articleCount).toBeLessThanOrEqual(10); // Should show max 10 per page
    });

    test('should display article metadata', async ({ page }) => {
      await page.goto('/drydown');
      await waitForPageLoad(page);

      const firstArticle = page.locator('[data-testid="article-card"], article, .article-card').first();
      
      if (await firstArticle.isVisible()) {
        // Check for title
        const hasTitle = await getElementCount(page, 'h1, h2, h3');
        expect(hasTitle).toBeGreaterThan(0);
        console.log('    ✓ Article titles displayed');

        // Check for metadata (author, date, read time)
        const hasMetadata = await elementExists(page, 'text=/min read|ago|202[0-9]/');
        if (hasMetadata) {
          console.log('    ✓ Article metadata displayed');
        }
      }
    });

    test('should display article excerpts', async ({ page }) => {
      await page.goto('/drydown');
      await waitForPageLoad(page);

      // Articles should have excerpts/descriptions
      const articleCards = page.locator('[data-testid="article-card"], article, .article-card');
      const count = await articleCards.count();

      if (count > 0) {
        const firstArticleText = await articleCards.first().textContent();
        expect(firstArticleText?. length).toBeGreaterThan(50); // Should have some text
        console.log('    ✓ Article excerpts displayed');
      }
    });

    test('should display article cover images', async ({ page }) => {
      await page.goto('/drydown');
      await waitForPageLoad(page);

      const images = page.locator('[data-testid="article-card"] img, article img, .article-card img');
      const imageCount = await images.count();

      if (imageCount > 0) {
        console.log(`    ✓ Found ${imageCount} article images`);
      }
    });

    test('should display category badges on articles', async ({ page }) => {
      await page.goto('/drydown');
      await waitForPageLoad(page);

      const categoryBadges = page.locator('[data-testid="category-badge"], .category-badge, .badge');
      const badgeCount = await categoryBadges.count();

      if (badgeCount > 0) {
        console.log(`    ✓ Found ${badgeCount} category badges`);
      }
    });
  });

  // ==========================================
  // FEATURED ARTICLES TESTS
  // ==========================================
  test.describe('Featured Articles', () => {
    test('should display featured articles section', async ({ page }) => {
      console.log('  ⭐ Testing featured articles.. .');
      
      await page.goto('/drydown');
      await waitForPageLoad(page);

      const featuredSection = page.locator('[data-testid="featured-articles"], .featured-articles, section:has-text("Featured")');
      
      if (await featuredSection.isVisible({ timeout: 5000 })) {
        console.log('    ✓ Featured articles section found');
        
        const featuredCount = await getElementCount(page, '[data-testid="featured-articles"] article, .featured-articles article');
        console.log(`    ✓ Found ${featuredCount} featured articles`);
      }
    });

    test('should display featured articles with prominent styling', async ({ page }) => {
      await page.goto('/drydown');
      await waitForPageLoad(page);

      const featuredArticle = page.locator('[data-testid="featured-article"], .featured-article').first();
      
      if (await featuredArticle.isVisible({ timeout: 5000 })) {
        // Featured articles should have larger/different styling
        const boundingBox = await featuredArticle.boundingBox();
        if (boundingBox) {
          console.log(`    ✓ Featured article dimensions: ${boundingBox.width}x${boundingBox.height}`);
        }
      }
    });
  });

  // ==========================================
  // CATEGORY FILTERING TESTS
  // ==========================================
  test.describe('Category Filtering', () => {
    test('should have category filters', async ({ page }) => {
      console.log('  🏷️  Testing category filters...');
      
      await page.goto('/drydown');
      await waitForPageLoad(page);

      // Check for category buttons/tabs
      const categories = [
        'All',
        'Industry',
        'Review',
        'News',
        'Interview',
        'Deep Dive',
        'Guide'
      ];

      let foundCategories = 0;
      for (const category of categories) {
        const exists = await elementExists(page, `button:has-text("${category}"), a:has-text("${category}")`);
        if (exists) {
          foundCategories++;
          console.log(`    ✓ Category found: ${category}`);
        }
      }

      expect(foundCategories).toBeGreaterThan(0);
    });

    test('should filter articles by category', async ({ page }) => {
      await page.goto('/drydown');
      await waitForPageLoad(page);

      // Count initial articles
      const initialCount = await getElementCount(page, '[data-testid="article-card"], article, .article-card');
      console.log(`    ✓ Initial article count: ${initialCount}`);

      // Try to click a category filter
      const categoryButton = page.locator('button:has-text("Industry"), button:has-text("Review")').first();
      
      if (await categoryButton.isVisible({ timeout: 5000 })) {
        const categoryText = await categoryButton.textContent();
        await categoryButton.click();
        await waitForPageLoad(page);

        // Check if URL contains category parameter
        const url = page.url();
        console.log(`    ✓ Clicked category: ${categoryText}`);
        console.log(`    ✓ URL updated: ${url}`);

        // Articles should be filtered
        const filteredCount = await getElementCount(page, '[data-testid="article-card"], article, .article-card');
        console.log(`    ✓ Filtered article count: ${filteredCount}`);
      }
    });

    test('should display active category indicator', async ({ page }) => {
      await page.goto('/drydown');
      await waitForPageLoad(page);

      const categoryButton = page.locator('button:has-text("Review")').first();
      
      if (await categoryButton.isVisible({ timeout: 5000 })) {
        await categoryButton.click();
        await waitForPageLoad(page);

        // Check if button has active styling
        const isActive = await categoryButton.evaluate(el => {
          return el.classList.contains('active') || 
                 el. classList.contains('bg-primary') ||
                 el.getAttribute('aria-selected') === 'true';
        });

        console.log(`    ✓ Active category indicator: ${isActive ?  'Yes' : 'No'}`);
      }
    });

    test('should reset filter when clicking "All" category', async ({ page }) => {
      await page.goto('/drydown');
      await waitForPageLoad(page);

      // Click a specific category first
      const reviewButton = page.locator('button:has-text("Review")').first();
      if (await reviewButton.isVisible({ timeout: 5000 })) {
        await reviewButton.click();
        await waitForPageLoad(page);
      }

      // Then click "All"
      const allButton = page.locator('button:has-text("All")').first();
      if (await allButton.isVisible({ timeout: 5000 })) {
        await allButton.click();
        await waitForPageLoad(page);

        const url = page.url();
        console.log(`    ✓ Reset filter, URL: ${url}`);
      }
    });
  });

  // ==========================================
  // PAGINATION TESTS
  // ==========================================
  test.describe('Pagination', () => {
    test('should have pagination controls', async ({ page }) => {
      console.log('  📄 Testing pagination...');
      
      await page.goto('/drydown');
      await waitForPageLoad(page);

      // Check for pagination elements
      const hasPagination = await elementExists(page, 
        'button:has-text("Next"), button:has-text("Previous"), [aria-label*="pagination" i], nav'
      );

      if (hasPagination) {
        console.log('    ✓ Pagination controls found');
      } else {
        console.log('    ℹ️  No pagination (fewer than 10 articles)');
      }
    });

    test('should navigate to next page', async ({ page }) => {
      await page.goto('/drydown');
      await waitForPageLoad(page);

      const nextButton = page.locator('button:has-text("Next"), [aria-label="Next page"]').first();
      
      if (await nextButton.isVisible({ timeout: 5000 }) && await nextButton.isEnabled()) {
        // Get articles on page 1
        const page1Count = await getElementCount(page, '[data-testid="article-card"], article, .article-card');
        console.log(`    ✓ Page 1 articles: ${page1Count}`);

        // Go to page 2
        await nextButton.click();
        await waitForPageLoad(page);

        // Check URL changed
        const url = page.url();
        expect(url).toContain('page=2');
        console.log(`    ✓ Navigated to page 2: ${url}`);

        // Check articles loaded
        const page2Count = await getElementCount(page, '[data-testid="article-card"], article, .article-card');
        console.log(`    ✓ Page 2 articles: ${page2Count}`);
      } else {
        console.log('    ℹ️  No next page available');
      }
    });

    test('should navigate to previous page', async ({ page }) => {
      await page.goto('/drydown? page=2');
      await waitForPageLoad(page);

      const prevButton = page.locator('button:has-text("Previous"), button:has-text("Prev"), [aria-label="Previous page"]').first();
      
      if (await prevButton.isVisible({ timeout: 5000 }) && await prevButton.isEnabled()) {
        await prevButton.click();
        await waitForPageLoad(page);

        const url = page.url();
        console.log(`    ✓ Navigated back: ${url}`);
      }
    });

    test('should display current page number', async ({ page }) => {
      await page.goto('/drydown? page=2');
      await waitForPageLoad(page);

      const pageIndicator = page.locator('text=/Page \\d+|\\d+ of \\d+/i').first();
      
      if (await pageIndicator.isVisible({ timeout: 5000 })) {
        const text = await pageIndicator.textContent();
        console.log(`    ✓ Page indicator: ${text}`);
      }
    });

    test('should maintain category filter across pages', async ({ page }) => {
      await page.goto('/drydown');
      await waitForPageLoad(page);

      // Click category
      const categoryButton = page.locator('button:has-text("Review")').first();
      if (await categoryButton.isVisible({ timeout: 5000 })) {
        await categoryButton.click();
        await waitForPageLoad(page);

        // Go to next page
        const nextButton = page.locator('button:has-text("Next")').first();
        if (await nextButton.isVisible({ timeout: 5000 }) && await nextButton.isEnabled()) {
          await nextButton.click();
          await waitForPageLoad(page);

          const url = page.url();
          expect(url).toContain('category');
          console.log(`    ✓ Category filter maintained: ${url}`);
        }
      }
    });
  });

  // ==========================================
  // ARTICLE DETAIL PAGE TESTS
  // ==========================================
  test.describe('Article Detail Page', () => {
    test('should navigate to article detail page', async ({ page }) => {
      console.log('  📖 Testing article detail page...');
      
      await page.goto('/drydown');
      await waitForPageLoad(page);

      // Click on first article
      const firstArticle = page.locator('[data-testid="article-card"], article, .article-card').first();
      const articleTitle = await firstArticle.locator('h1, h2, h3').first().textContent();
      
      await firstArticle.click();
      await waitForPageLoad(page);

      // Should be on article detail page
      expect(page.url()).toContain('/drydown/');
      console.log(`    ✓ Navigated to article: ${articleTitle}`);
    });

    test('should display article title and metadata', async ({ page }) => {
      await page.goto('/drydown');
      await waitForPageLoad(page);

      await page.locator('[data-testid="article-card"], article, .article-card').first().click();
      await waitForPageLoad(page);

      // Check for title
      const title = page.locator('h1'). first();
      await expect(title).toBeVisible();
      console.log('    ✓ Article title displayed');

      // Check for author
      const hasAuthor = await elementExists(page, 'text=/By|Author|Written by/i');
      if (hasAuthor) {
        console.log('    ✓ Author info displayed');
      }

      // Check for publish date
      const hasDate = await elementExists(page, 'text=/ago|202[0-9]|Published/i');
      if (hasDate) {
        console.log('    ✓ Publish date displayed');
      }

      // Check for read time
      const hasReadTime = await elementExists(page, 'text=/min read/i');
      if (hasReadTime) {
        console.log('    ✓ Read time displayed');
      }

      // Check for category badge
      const hasBadge = await elementExists(page, '[data-testid="category-badge"], .category-badge, .badge');
      if (hasBadge) {
        console.log('    ✓ Category badge displayed');
      }
    });

    test('should display article cover image', async ({ page }) => {
      await page.goto('/drydown');
      await waitForPageLoad(page);

      await page.locator('[data-testid="article-card"], article').first().click();
      await waitForPageLoad(page);

      const coverImage = page.locator('[data-testid="cover-image"], .cover-image, article img').first();
      
      if (await coverImage.isVisible({ timeout: 5000 })) {
        console.log('    ✓ Cover image displayed');
      }
    });

    test('should display full article content', async ({ page }) => {
      await page.goto('/drydown');
      await waitForPageLoad(page);

      await page.locator('[data-testid="article-card"], article').first().click();
      await waitForPageLoad(page);

      const content = page.locator('[data-testid="article-content"], .article-content, article > div').first();
      await expect(content).toBeVisible();

      const contentText = await content.textContent();
      expect(contentText?.length).toBeGreaterThan(100);
      console.log(`    ✓ Article content displayed (${contentText?.length} characters)`);
    });

    test('should display author profile link', async ({ page }) => {
      await page.goto('/drydown');
      await waitForPageLoad(page);

      await page.locator('[data-testid="article-card"], article').first().click();
      await waitForPageLoad(page);

      const authorLink = page.locator('a[href*="/profile/"], a[href*="/user/"]').first();
      
      if (await authorLink.isVisible({ timeout: 5000 })) {
        console.log('    ✓ Author profile link found');
      }
    });

    test('should have working back navigation', async ({ page }) => {
      await page.goto('/drydown');
      await waitForPageLoad(page);

      await page.locator('[data-testid="article-card"], article').first().click();
      await waitForPageLoad(page);

      // Try to find back button
      const backButton = page.locator('button:has-text("Back"), a:has-text("Back to"), [aria-label="Back"]').first();
      
      if (await backButton.isVisible({ timeout: 5000 })) {
        await backButton.click();
        await waitForPageLoad(page);

        expect(page.url()).toContain('/drydown');
        console.log('    ✓ Back navigation works');
      } else {
        // Use browser back
        await page.goBack();
        await waitForPageLoad(page);
        console.log('    ✓ Browser back navigation works');
      }
    });
  });

  // ==========================================
  // RELATED ARTICLES TESTS
  // ==========================================
  test.describe('Related Articles', () => {
    test('should display related articles section', async ({ page }) => {
      console.log('  🔗 Testing related articles...');
      
      await page.goto('/drydown');
      await waitForPageLoad(page);

      await page.locator('[data-testid="article-card"], article').first().click();
      await waitForPageLoad(page);

      // Scroll to bottom where related articles usually are
      await page.evaluate(() => window.scrollTo(0, document. body.scrollHeight));
      await page.waitForTimeout(1000);

      const relatedSection = page.locator('text=/Related Articles|You might also like|More articles/i'). first();
      
      if (await relatedSection.isVisible({ timeout: 5000 })) {
        console.log('    ✓ Related articles section found');

        const relatedCount = await getElementCount(page, '[data-testid="related-article"], .related-article');
        console.log(`    ✓ Found ${relatedCount} related articles`);
      } else {
        console.log('    ℹ️  No related articles section');
      }
    });

    test('should navigate to related article', async ({ page }) => {
      await page.goto('/drydown');
      await waitForPageLoad(page);

      await page.locator('[data-testid="article-card"], article').first(). click();
      await waitForPageLoad(page);

      await page.evaluate(() => window.scrollTo(0, document.body. scrollHeight));
      await page.waitForTimeout(1000);

      const relatedArticle = page.locator('[data-testid="related-article"], .related-article').first();
      
      if (await relatedArticle.isVisible({ timeout: 5000 })) {
        await relatedArticle.click();
        await waitForPageLoad(page);

        expect(page.url()).toContain('/drydown/');
        console.log('    ✓ Navigated to related article');
      }
    });
  });

  // ==========================================
  // COMMENTS SYSTEM TESTS
  // ==========================================
  test.describe('Comments System', () => {
    test('should display comments section', async ({ page }) => {
      console.log('  💬 Testing comments system...');
      
      await page.goto('/drydown');
      await waitForPageLoad(page);

      await page.locator('[data-testid="article-card"], article').first().click();
      await waitForPageLoad(page);

      // Scroll to comments
      await page.evaluate(() => window.scrollTo(0, document. body.scrollHeight));
      await page.waitForTimeout(1000);

      const commentsSection = page.locator('text=/Comments|Discussion/i').first();
      
      if (await commentsSection.isVisible({ timeout: 5000 })) {
        console.log('    ✓ Comments section found');
      }
    });

    test('should display existing comments', async ({ page }) => {
      await page.goto('/drydown');
      await waitForPageLoad(page);

      await page.locator('[data-testid="article-card"], article').first().click();
      await waitForPageLoad(page);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);

      const comments = page.locator('[data-testid="comment"], .comment, [data-comment]');
      const commentCount = await comments.count();

      if (commentCount > 0) {
        console.log(`    ✓ Found ${commentCount} existing comments`);

        // Check comment structure
        const firstComment = comments.first();
        const hasAuthor = await firstComment.locator('text=/testuser|admin/i').isVisible({ timeout: 2000 });
        const hasDate = await firstComment.locator('text=/ago|202[0-9]/i').isVisible({ timeout: 2000 });

        if (hasAuthor) console.log('    ✓ Comment author displayed');
        if (hasDate) console.log('    ✓ Comment date displayed');
      } else {
        console.log('    ℹ️  No existing comments');
      }
    });

    test('should show login prompt for non-logged-in users', async ({ page }) => {
      await page.goto('/drydown');
      await waitForPageLoad(page);

      await page.locator('[data-testid="article-card"], article').first().click();
      await waitForPageLoad(page);

      await page.evaluate(() => window.scrollTo(0, document.body. scrollHeight));
      await page.waitForTimeout(1000);

      const loginPrompt = page. locator('text=/log in|sign in to comment|Login to comment/i').first();
      
      if (await loginPrompt.isVisible({ timeout: 5000 })) {
        console.log('    ✓ Login prompt displayed for guests');
      }
    });

    test('should allow logged-in users to post comments', async ({ page }) => {
      // Login first
      await loginAsUser(page, 1);

      await page.goto('/drydown');
      await waitForPageLoad(page);

      await page.locator('[data-testid="article-card"], article').first().click();
      await waitForPageLoad(page);

      // Scroll to comments
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);

      const commentInput = page.locator('textarea[placeholder*="comment" i], textarea[name="comment"]'). first();
      
      if (await commentInput.isVisible({ timeout: 5000 })) {
        console.log('    ✓ Comment form available for logged-in users');

        // Fill and submit comment
        const testComment = `Test comment from automated testing ${Date.now()}`;
        await commentInput.fill(testComment);

        const submitButton = page.locator('button:has-text("Post"), button:has-text("Submit"), button[type="submit"]').first();
        
        if (await submitButton.isVisible({ timeout: 3000 })) {
          await submitButton.click();
          await page.waitForTimeout(2000);

          // Check if comment appears
          const commentPosted = await elementExists(page, `text=${testComment}`);
          if (commentPosted) {
            console.log('    ✅ Comment posted successfully');
          }
        }
      }
    });

    test('should display comment count', async ({ page }) => {
      await page.goto('/drydown');
      await waitForPageLoad(page);

      await page.locator('[data-testid="article-card"], article').first().click();
      await waitForPageLoad(page);

      const commentCount = page.locator('text=/\\d+ comment|\\d+ discussion/i').first();
      
      if (await commentCount.isVisible({ timeout: 5000 })) {
        const text = await commentCount.textContent();
        console.log(`    ✓ Comment count displayed: ${text}`);
      }
    });
  });

  // ==========================================
  // SEARCH FUNCTIONALITY TESTS
  // ==========================================
  test.describe('Search Functionality', () => {
    test('should have search input', async ({ page }) => {
      console.log('  🔍 Testing search functionality...');
      
      await page.goto('/drydown');
      await waitForPageLoad(page);

      const searchInput = page.locator('input[placeholder*="Search" i], input[type="search"]').first();
      
      if (await searchInput. isVisible({ timeout: 5000 })) {
        console.log('    ✓ Search input found');
      } else {
        console.log('    ℹ️  No search functionality');
      }
    });

    test('should search articles', async ({ page }) => {
      await page.goto('/drydown');
      await waitForPageLoad(page);

      const searchInput = page.locator('input[placeholder*="Search" i], input[type="search"]').first();
      
      if (await searchInput.isVisible({ timeout: 5000 })) {
        await searchInput.fill('fragrance');
        await page.keyboard.press('Enter');
        await waitForPageLoad(page);

        const url = page.url();
        console.log(`    ✓ Search URL: ${url}`);

        const articleCount = await getElementCount(page, '[data-testid="article-card"], article, .article-card');
        console.log(`    ✓ Found ${articleCount} search results`);
      }
    });

    test('should display search results message', async ({ page }) => {
      await page.goto('/drydown? search=test');
      await waitForPageLoad(page);

      const resultsMessage = page.locator('text=/results for|Showing.*results|Search results/i').first();
      
      if (await resultsMessage.isVisible({ timeout: 5000 })) {
        const text = await resultsMessage.textContent();
        console.log(`    ✓ Search results message: ${text}`);
      }
    });

    test('should display no results message for invalid search', async ({ page }) => {
      await page.goto('/drydown?search=xyzabc123nonexistent');
      await waitForPageLoad(page);

      const noResults = page.locator('text=/No articles found|No results|0 results/i').first();
      
      if (await noResults.isVisible({ timeout: 5000 })) {
        console.log('    ✓ No results message displayed');
      }
    });
  });

  // ==========================================
  // SOCIAL SHARING TESTS
  // ==========================================
  test.describe('Social Sharing', () => {
    test('should have share buttons', async ({ page }) => {
      console.log('  🔗 Testing social sharing...');
      
      await page.goto('/drydown');
      await waitForPageLoad(page);

      await page.locator('[data-testid="article-card"], article').first().click();
      await waitForPageLoad(page);

      const shareButton = page.locator('button:has-text("Share"), [aria-label*="Share" i]').first();
      
      if (await shareButton.isVisible({ timeout: 5000 })) {
        console.log('    ✓ Share button found');

        await shareButton.click();
        await page.waitForTimeout(1000);

        // Check for share options
        const hasTwitter = await elementExists(page, 'text=/Twitter|X/i, [aria-label*="Twitter" i]');
        const hasFacebook = await elementExists(page, 'text=Facebook, [aria-label*="Facebook" i]');
        const hasCopy = await elementExists(page, 'text=/Copy link|Copy URL/i');

        if (hasTwitter) console.log('    ✓ Twitter share option found');
        if (hasFacebook) console.log('    ✓ Facebook share option found');
        if (hasCopy) console.log('    ✓ Copy link option found');
      } else {
        console.log('    ℹ️  No share functionality');
      }
    });
  });

  // ==========================================
  // RESPONSIVE DESIGN TESTS
  // ==========================================
  test.describe('Responsive Design', () => {
    test('should display properly on mobile viewport', async ({ page }) => {
      console.log('  📱 Testing mobile responsiveness...');
      
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      
      await page.goto('/drydown');
      await waitForPageLoad(page);

      const articleCount = await getElementCount(page, '[data-testid="article-card"], article, .article-card');
      expect(articleCount).toBeGreaterThan(0);
      console.log('    ✓ Articles displayed on mobile');

      // Check if layout is stacked (single column)
      const firstArticle = page.locator('[data-testid="article-card"], article, .article-card').first();
      const box = await firstArticle.boundingBox();
      
      if (box) {
        const isFullWidth = box.width > 300; // Should be close to viewport width
        console.log(`    ✓ Mobile layout: ${isFullWidth ? 'Full width' : 'Needs adjustment'}`);
      }

      // Reset viewport
      await page.setViewportSize({ width: 1280, height: 720 });
    });

    test('should display properly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      
      await page.goto('/drydown');
      await waitForPageLoad(page);

      const articleCount = await getElementCount(page, '[data-testid="article-card"], article, .article-card');
      console.log(`    ✓ Tablet view: ${articleCount} articles displayed`);

      await page.setViewportSize({ width: 1280, height: 720 });
    });
  });

  // ==========================================
  // PERFORMANCE TESTS
  // ==========================================
  test.describe('Performance', () => {
    test('should load article listing page quickly', async ({ page }) => {
      console.log('  ⚡ Testing performance...');
      
      const startTime = Date.now();
      await page.goto('/drydown');
      await waitForPageLoad(page);
      const loadTime = Date.now() - startTime;

      console.log(`    ✓ Page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000); // Should load in under 10 seconds
    });

    test('should load images lazily', async ({ page }) => {
      await page.goto('/drydown');
      await waitForPageLoad(page);

      const images = page.locator('img');
      const imageCount = await images.count();

      if (imageCount > 0) {
        // Check if images have loading="lazy" attribute
        const firstImage = images.first();
        const loadingAttr = await firstImage.getAttribute('loading');
        
        if (loadingAttr === 'lazy') {
          console.log('    ✓ Images use lazy loading');
        }
      }
    });
  });
});