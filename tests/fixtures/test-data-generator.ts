import { PrismaClient, NotificationType } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getMongoDb } from '../../src/lib/mongodb';

const prisma = new PrismaClient();

export interface TestDataIds {
  adminUserId: string;
  userIds: string[];
  brandIds: string[];
  perfumeIds: string[];
  articleIds: string[];
  submissionIds: string[];
  applicationIds: string[];
}

export async function generateTestData(): Promise<TestDataIds> {
  console.log('🌱 Starting hybrid test data generation...');

  const testDataIds: TestDataIds = {
    adminUserId: '',
    userIds: [],
    brandIds: [],
    perfumeIds: [],
    articleIds: [],
    submissionIds: [],
    applicationIds: [],
  };

  try {
    // Connect to MongoDB
    const mongoDb = await getMongoDb();
    const brandsCollection = mongoDb.collection('brands');
    const perfumesCollection = mongoDb.collection('perfumes');

    // ==========================================
    // 1. CREATE TEST ADMIN USER (SUPABASE)
    // ==========================================
    console.log('👤 Creating test admin user in Supabase...');
    const hashedPassword = await bcrypt.hash('TestAdmin123$', 10);

    // Check if admin already exists (by username OR email)
    let adminUser = await prisma.user. findFirst({
      where: {
        OR: [
          { email: 'admin@fragview.com' },
          { username: 'testadmin' }
        ]
      }
    });

    if (!adminUser) {
      adminUser = await prisma. user.create({
        data: {
          email: 'admin@fragview.com',
          username: 'testadmin',
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: new Date(),
        },
      });
      console.log('✅ Admin user created:', adminUser. email);
    } else {
      console.log('↻ Admin user already exists, reusing:', adminUser.email);
      
      // Update password in case it changed
      adminUser = await prisma.user.update({
        where: { id: adminUser.id },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: adminUser.emailVerified || new Date(),
        }
      });
    }

    testDataIds.adminUserId = adminUser.id;
    console.log('✅ Admin user ready:', adminUser.email);

    // ==========================================
    // 2. CREATE TEST USERS (SUPABASE)
    // ==========================================
    console.log('👥 Creating 20 test users in Supabase...');
    for (let i = 1; i <= 20; i++) {
      const username = `testuser${i}`;
      
      let user = await prisma.user. findUnique({
        where: { username }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: `testuser${i}@fragview.com`,
            username,
            password: hashedPassword,
            bio: faker.lorem.sentence(),
            location: faker.location.city(),
            experiencePoints: faker.number.int({ min: 0, max: 5000 }),
            badges: faker.helpers.arrayElements(['Reviewer', 'Explorer', 'Connoisseur'], faker.number.int({ min: 0, max: 3 })),
            emailVerified: new Date(),
          },
        });
      }
      
      testDataIds.userIds.push(user.id);
    }
    console.log('✅ 20 test users created');

    // ==========================================
    // 3. CREATE TEST BRANDS (MONGODB)
    // ==========================================
    console.log('🏢 Creating 10 test brands in MongoDB...');
    const brandNames = [
      'Test Chanel', 'Test Dior', 'Test Tom Ford', 'Test Creed', 'Test Hermès',
      'Test Jo Malone', 'Test MFK', 'Test Le Labo', 'Test Byredo', 'Test Acqua di Parma'
    ];
    
    for (const name of brandNames) {
      const slug = name.toLowerCase().replace(/\s+/g, '-'). replace(/[^a-z0-9-]/g, '');
      
      const existing = await brandsCollection.findOne({ slug });
      
      if (!existing) {
        const brandDoc = {
          _id: new ObjectId(),
          name,
          slug,
          name_display: `${name} perfumes and colognes`,
          name_key: slug. replace(/-/g, '') + 'perfumesandcolognes',
          description: faker.lorem.paragraph(),
          country: faker.location.country(),
          founded: faker.date.past({ years: 100 }). getFullYear(). toString(),
          official_website: `https://www.${slug}.com`,
          parent_company: null,
          perfumes: [],
          perfumes_count: 0,
          collections_info: [
            {
              name: 'All Fragrances',
              slug: 'ALL-FRAGRANCES',
              perfume_count: 0
            }
          ],
          source_data: {
            fragrantica: {
              url: `https://www.fragrantica.com/designers/${slug}. html`,
              scraped_at: new Date().toISOString()
            }
          },
          testData: true, // 🔥 Important for cleanup
          updated_at: new Date(),
        };
        
        await brandsCollection. insertOne(brandDoc);
        testDataIds.brandIds.push(brandDoc._id.toString());
        console.log(`  ✓ Created brand: ${name}`);
      } else {
        testDataIds.brandIds.push(existing._id.toString());
        console.log(`  ↻ Brand exists: ${name}`);
      }
    }
    console.log('✅ 10 test brands ready in MongoDB');

    // ==========================================
    // 4. CREATE TEST PERFUMES (MONGODB)
    // ==========================================
    console.log('🌸 Creating 50 test perfumes in MongoDB...');
    
    const genders = ['male', 'female', 'unisex'];
    const topNotes = ['bergamot', 'lemon', 'orange', 'lavender', 'rose', 'grapefruit', 'mandarin'];
    const middleNotes = ['jasmine', 'iris', 'ylang-ylang', 'geranium', 'lily', 'violet'];
    const baseNotes = ['sandalwood', 'cedar', 'musk', 'amber', 'vanilla', 'patchouli', 'vetiver'];
    const accordNames = ['woody', 'floral', 'citrus', 'oriental', 'fresh', 'spicy', 'aquatic', 'fruity'];
    
    for (let i = 0; i < 50; i++) {
      const randomBrandId = testDataIds.brandIds[Math. floor(Math.random() * testDataIds.brandIds.length)];
      const perfumeName = `Test ${faker.commerce.productName()}`;
      const slug = perfumeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + i;
      
      const existing = await perfumesCollection. findOne({ slug });
      
      if (!existing) {
        const selectedAccords = faker.helpers.arrayElements(accordNames, 4);
        const accords = selectedAccords.map((accord, index) => ({
          name: accord,
          width: 100 - (index * 15)
        }));

        const perfumeDoc = {
          _id: new ObjectId(),
          name: perfumeName,
          slug,
          variant_name: perfumeName,
          brand_name: 'Test Brand',
          gender: faker.helpers.arrayElement(genders),
          release_year: faker.date.past({ years: 30 }).getFullYear(),
          perfume_image: `https://fimgs.net/mdimg/perfume/375x500. ${faker.number.int({ min: 10000, max: 99999 })}.jpg`,
          image: `https://4gkxi5h7bnayykfq.public.blob.vercel-storage.com/perfumes/test-${i}.jpg`,
          perfume_overview: faker.lorem.paragraphs(2),
          perfumers: [faker.person.fullName()],
          pyramids: {
            top: faker.helpers.arrayElements(topNotes, 3),
            middle: faker.helpers.arrayElements(middleNotes, 2),
            base: faker.helpers.arrayElements(baseNotes, 3),
          },
          accords: accords,
          rating: parseFloat(faker.number.float({ min: 3, max: 5, precision: 0.01 }). toFixed(2)),
          longevity: parseFloat(faker.number.float({ min: 2, max: 5, precision: 0.01 }).toFixed(2)),
          sillage: parseFloat(faker. number.float({ min: 2, max: 4, precision: 0.01 }).toFixed(2)),
          votes: faker.number.int({ min: 10, max: 500 }),
          reminds_me: [],
          user_reviews: [],
          user_reviews_summary: '- Positives (0): \n- Negatives (0): ',
          url: `https://www.fragrantica.com/perfume/Test-Brand/${slug}-${faker.number.int({ min: 10000, max: 99999 })}.html`,
          scraped_at: new Date().toISOString(). split('T')[0] + ' 00:00:00',
          testData: true, // 🔥 Important for cleanup
        };
        
        await perfumesCollection.insertOne(perfumeDoc);
        testDataIds.perfumeIds.push(perfumeDoc._id.toString());
        
        if ((i + 1) % 10 === 0) {
          console.log(`  ✓ Created ${i + 1}/50 perfumes... `);
        }
      }
    }
    console.log('✅ 50 test perfumes created in MongoDB');

    // ==========================================
    // 5. CREATE TEST REVIEWS (SUPABASE)
    // ==========================================
    console.log('⭐ Creating 100 test reviews in Supabase...');
    for (let i = 0; i < 100; i++) {
      const randomUserId = testDataIds.userIds[Math.floor(Math.random() * testDataIds.userIds.length)];
      const randomPerfumeId = testDataIds.perfumeIds[Math. floor(Math.random() * testDataIds.perfumeIds. length)];
      
      await prisma.review.create({
        data: {
          userId: randomUserId,
          perfumeId: randomPerfumeId, // MongoDB ObjectId as string
          rating: faker.number.int({ min: 1, max: 5 }),
          title: faker.lorem.sentence(),
          text: faker.lorem.paragraphs(3),
          longevity: faker.number.int({ min: 1, max: 10 }),
          sillage: faker. number.int({ min: 1, max: 10 }),
          photos: faker.helpers.maybe(() => [
            faker.image.url(),
            faker.image.url()
          ], { probability: 0.2 }) || [],
          tags: faker.helpers.arrayElements(['summer', 'office', 'date night', 'casual'], 2),
          helpfulCount: faker.number.int({ min: 0, max: 50 }),
          likeCount: faker.number.int({ min: 0, max: 30 }),
        },
      });
      
      if ((i + 1) % 25 === 0) {
        console.log(`  ✓ Created ${i + 1}/100 reviews...`);
      }
    }
    console. log('✅ 100 test reviews created in Supabase');

    // ==========================================
    // 6. CREATE TEST RATINGS (SUPABASE)
    // ==========================================
    console.log('⭐ Creating test ratings in Supabase...');
    let ratingsCreated = 0;
    for (const userId of testDataIds.userIds. slice(0, 15)) {
      const randomPerfumes = faker.helpers.arrayElements(testDataIds.perfumeIds, 10);
      
      for (const perfumeId of randomPerfumes) {
        await prisma.rating.create({
          data: {
            userId,
            perfumeId,
            rating: faker.number.int({ min: 1, max: 5 }),
          },
        });
        ratingsCreated++;
      }
    }
    console.log(`✅ ${ratingsCreated} test ratings created`);

    // ==========================================
    // 7. CREATE TEST WARDROBE ENTRIES (SUPABASE)
    // ==========================================
    console.log('👔 Creating test wardrobe entries in Supabase...');
    let wardrobeCreated = 0;
    for (const userId of testDataIds. userIds. slice(0, 10)) {
      const randomPerfumes = faker.helpers.arrayElements(testDataIds.perfumeIds, 8);
      
      for (const perfumeId of randomPerfumes) {
        await prisma.wardrobeEntry.create({
          data: {
            userId,
            perfumeId,
            subcategory: faker.helpers.arrayElement(['Daily Wear', 'Special Occasions', 'Evening', 'Work', 'Weekend']),
            status: faker.helpers.arrayElement(['CURRENTLY_USING', 'WISH_LIST', 'IN_COLLECTION', 'USED_UP']),
            notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.5 }),
          },
        });
        wardrobeCreated++;
      }
    }
    console.log(`✅ ${wardrobeCreated} test wardrobe entries created`);

    // ==========================================
    // 8. CREATE TEST ARTICLES (SUPABASE)
    // ==========================================
    console.log('📝 Creating 15 test articles in Supabase...');
    const categories = ['FRAGRANCE_BASICS', 'REVIEWS', 'INDUSTRY_NEWS', 'SCENT_PROFILES', 'BRAND_SPOTLIGHTS', 'SEASONAL_GUIDES'];
    
    for (let i = 0; i < 15; i++) {
      const isPublished = i < 12; // 12 published, 3 drafts
      const title = faker.lorem.sentence();
      
      const article = await prisma.article.create({
        data: {
          title: title,
          slug: `test-article-${faker.lorem.slug()}-${i}`,
          excerpt: faker.lorem.paragraph(),
          content: `# ${title}\n\n${faker.lorem. paragraphs(10, '\n\n')}`,
          coverImage: faker.image.url(),
          category: faker.helpers.arrayElement(categories),
          published: isPublished,
          authorId: testDataIds.adminUserId,
          publishedAt: isPublished ? faker.date.recent({ days: 30 }) : null,
          readTime: `${faker.number.int({ min: 3, max: 15 })} min`,
          mentionedPerfumes: faker.helpers.arrayElements(testDataIds.perfumeIds, faker.number.int({ min: 1, max: 5 })),
        },
      });
      testDataIds.articleIds.push(article.id);
      console.log(`  ✓ Created article ${i + 1}/15: ${isPublished ? 'PUBLISHED' : 'DRAFT'}`);
    }
    console.log('✅ 15 test articles created');

    // ==========================================
    // 9. CREATE PENDING SUBMISSIONS (SUPABASE)
    // ==========================================
    console.log('📤 Creating 10 pending submissions in Supabase...');
    for (let i = 0; i < 10; i++) {
      const randomUserId = testDataIds.userIds[Math. floor(Math.random() * testDataIds.userIds.length)];
      const isPerfume = i < 5;
      
      const submission = await prisma.communitySubmission.create({
        data: {
          type: isPerfume ? 'PERFUME' : 'BRAND',
          userId: randomUserId,
          status: 'PENDING',
          data: isPerfume ? {
            name: faker.commerce.productName(),
            brandName: faker.company.name(),
            releaseYear: faker.date.past({ years: 10 }).getFullYear(),
            description: faker.lorem.paragraph(),
            perfumer: faker.person.fullName(),
            notes: faker.helpers.arrayElements(['rose', 'vanilla', 'musk'], 3),
          } : {
            name: faker.company.name(),
            description: faker.lorem.paragraph(),
            founded: faker.date.past({ years: 50 }).getFullYear().toString(),
            country: faker.location.country(),
            website: faker.internet.url(),
          },
        },
      });
      testDataIds.submissionIds.push(submission.id);
      console.log(`  ✓ Created ${isPerfume ? 'PERFUME' : 'BRAND'} submission ${i + 1}/10`);
    }
    console.log('✅ 10 pending submissions created');

    // ==========================================
    // 10. CREATE BRAND APPLICATIONS (SUPABASE)
    // ==========================================
    console.log('🏢 Creating 5 brand owner applications in Supabase...');

    for (let i = 0; i < 5; i++) {
      // Generate safe, truncated values
      const brandName = `Test Brand App ${i + 1}`;
      const companyName = faker. company.name();
      const country = faker.location.country();
      const website = faker.internet.url();
      const contactName = faker.person. fullName();
      const contactEmail = `testbrand${i + 1}@example.com`;
      const contactPhone = faker.string.numeric(10); // Just 10 digits
      const position = faker.helpers.arrayElement(['Owner', 'Marketing Director', 'Brand Manager', 'CEO']);
      
      // Ensure all strings are within database limits
      const safeData = {
        brandName: brandName.substring(0, 200),
        companyName: companyName.substring(0, 200),
        country: country. substring(0, 100),
        website: website.substring(0, 255),
        contactName: contactName.substring(0, 100),
        contactEmail: contactEmail. substring(0, 255),
        contactPhone: contactPhone.substring(0, 20),
        position: position.substring(0, 100),
        brandData: {
          description: faker.lorem.paragraph(). substring(0, 500),
          founded: faker.date.past({ years: 50 }).getFullYear(). toString(),
          country: country.substring(0, 100),
        },
        perfumesData: {
          count: faker.number.int({ min: 1, max: 20 }),
          featured: ['Signature Scent', 'Summer Edition', 'Night Collection'],
        },
        verificationDocs: [
          `https://storage.example.com/verify/brand-${i + 1}-doc1.pdf`,
          `https://storage.example.com/verify/brand-${i + 1}-doc2.pdf`,
        ],
        status: 'PENDING' as const,
      };
      
      const application = await prisma.brandOwnerSubmission.create({
        data: safeData,
      });
      
      testDataIds.applicationIds.push(application. id);
      console.log(`  ✓ Created brand application ${i + 1}/5: ${brandName}`);
    }

    console.log('✅ 5 brand applications created');

    // ==========================================
    // 11. CREATE TEST NOTIFICATIONS (SUPABASE)
    // ==========================================
    console. log('🔔 Creating test notifications in Supabase...');
    const notificationTypes = Object.values(NotificationType);
    let notificationsCreated = 0;
    
    for (const userId of testDataIds.userIds. slice(0, 10)) {
      const notificationCount = faker.number.int({ min: 2, max: 5 });
      
      for (let i = 0; i < notificationCount; i++) {
        await prisma.notification.create({
          data: {
            userId,
            type: faker.helpers.arrayElement(notificationTypes),
            message: faker.lorem. sentence(),
            link: faker.helpers.arrayElement([
              '/profile',
              '/reviews',
              '/wardrobe',
              `/perfumes/${testDataIds.perfumeIds[0]}`,
            ]),
            read: faker.datatype.boolean(0.3), // 30% read
          },
        });
        notificationsCreated++;
      }
    }
    console.log(`✅ ${notificationsCreated} test notifications created`);

    // ==========================================
    // 12. CREATE TEST FOLLOWS (SUPABASE)
    // ==========================================
    console. log('👥 Creating test follow relationships in Supabase...');
    let followsCreated = 0;
    
    for (let i = 0; i < 30; i++) {
      const followerId = testDataIds.userIds[Math.floor(Math.random() * testDataIds.userIds. length)];
      const followingId = testDataIds.userIds[Math.floor(Math.random() * testDataIds.userIds.length)];
      
      if (followerId !== followingId) {
        try {
          await prisma.follow.create({
            data: {
              followerId,
              followingId,
            },
          });
          followsCreated++;
        } catch (error) {
          // Skip duplicate follows
        }
      }
    }
    console.log(`✅ ${followsCreated} test follow relationships created`);

    // ==========================================
    // SUMMARY
    // ==========================================
    console.log('\n' + '='.repeat(60));
    console.log('✅ HYBRID TEST DATA GENERATION COMPLETE! ');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   🟣 SUPABASE (PostgreSQL):`);
    console.log(`      - Admin User: 1`);
    console.log(`      - Regular Users: ${testDataIds.userIds.length}`);
    console.log(`      - Reviews: 100`);
    console.log(`      - Ratings: ${ratingsCreated}`);
    console.log(`      - Wardrobe Entries: ${wardrobeCreated}`);
    console.log(`      - Articles: ${testDataIds.articleIds.length} (12 published, 3 drafts)`);
    console.log(`      - Submissions: ${testDataIds.submissionIds.length}`);
    console.log(`      - Brand Applications: ${testDataIds.applicationIds.length}`);
    console.log(`      - Notifications: ${notificationsCreated}`);
    console.log(`      - Follow Relationships: ${followsCreated}`);
    console.log(`\n   🟢 MONGODB:`);
    console.log(`      - Brands: ${testDataIds.brandIds.length}`);
    console. log(`      - Perfumes: ${testDataIds.perfumeIds.length}`);
    console.log('\n' + '='.repeat(60) + '\n');

    return testDataIds;
  } catch (error) {
    console.error('❌ Error generating test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}