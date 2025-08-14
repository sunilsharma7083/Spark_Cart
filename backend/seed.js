const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Product = require('./models/Product');
const Category = require('./models/Category');
const User = require('./models/User');
const Order = require('./models/Order');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const sampleCategories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest electronic gadgets and devices',
    image: {
      public_id: 'categories/electronics',
      url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop&crop=center'
    }
  },
  {
    name: 'Clothing',
    slug: 'clothing',
    description: 'Fashion and apparel for all occasions',
    image: {
      public_id: 'categories/clothing',
      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center'
    }
  },
  {
    name: 'Books',
    slug: 'books',
    description: 'Wide selection of books and literature',
    image: {
      public_id: 'categories/books',
      url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&crop=center'
    }
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Everything for your home and garden needs',
    image: {
      public_id: 'categories/home-garden',
      url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&crop=center'
    }
  }
];

const sampleProducts = [
  {
    name: 'iPhone 15 Pro',
    slug: 'iphone-15-pro',
    description: 'Latest iPhone with advanced features and premium build quality',
    price: 82999,
    sku: 'IPHONE15PRO',
    images: [{ 
      public_id: 'iphone15pro',
      url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop&crop=center',
      alt: 'iPhone 15 Pro',
      isMain: true
    }],
    inventory: { quantity: 50 },
    status: 'active',
    featured: true,
    tags: ['smartphone', 'phone', 'apple', 'premium', 'mobile', 'electronics']
  },
  {
    name: 'MacBook Air M3',
    slug: 'macbook-air-m3',
    description: 'Powerful and lightweight laptop perfect for professionals',
    price: 107999,
    sku: 'MACBOOK-AIR-M3',
    images: [{ 
      public_id: 'macbook-air-m3',
      url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop&crop=center',
      alt: 'MacBook Air M3',
      isMain: true
    }],
    inventory: { quantity: 30 },
    status: 'active',
    featured: true,
    tags: ['laptop', 'apple', 'professional', 'computer', 'macbook', 'electronics']
  },
  {
    name: 'AirPods Pro',
    slug: 'airpods-pro',
    description: 'Premium wireless earbuds with noise cancellation',
    price: 20749,
    sku: 'AIRPODS-PRO',
    images: [{ 
      public_id: 'airpods-pro',
      url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop&crop=center',
      alt: 'AirPods Pro',
      isMain: true
    }],
    inventory: { quantity: 100 },
    status: 'active',
    featured: true,
    tags: ['earbuds', 'wireless', 'apple', 'headphones', 'audio', 'electronics']
  },
  {
    name: 'Cotton T-Shirt',
    slug: 'cotton-t-shirt',
    description: 'Comfortable 100% cotton t-shirt in various colors',
    price: 1659,
    sku: 'COTTON-TSHIRT',
    images: [{ 
      public_id: 'cotton-tshirt',
      url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center',
      alt: 'Cotton T-Shirt',
      isMain: true
    }],
    inventory: { quantity: 200 },
    status: 'active',
    featured: false,
    tags: ['clothing', 'cotton', 'casual', 'shirt']
  },
  {
    name: 'Programming Book Collection',
    slug: 'programming-book-collection',
    description: 'Essential books for learning programming and software development',
    price: 7469,
    sku: 'PROG-BOOKS',
    images: [{ 
      public_id: 'programming-books',
      url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=400&fit=crop&crop=center',
      alt: 'Programming Books',
      isMain: true
    }],
    inventory: { quantity: 75 },
    status: 'active',
    featured: true,
    tags: ['books', 'programming', 'education', 'learning']
  },
  {
    name: 'Smart Garden Kit',
    slug: 'smart-garden-kit',
    description: 'Automated garden kit for growing herbs and vegetables indoors',
    price: 12449,
    sku: 'SMART-GARDEN',
    images: [{ 
      public_id: 'smart-garden',
      url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&crop=center',
      alt: 'Smart Garden Kit',
      isMain: true
    }],
    inventory: { quantity: 25 },
    status: 'active',
    featured: true,
    tags: ['garden', 'smart', 'indoor', 'home']
  },
  // Electronics
  {
    name: 'Samsung Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    description: 'Flagship Android smartphone with S Pen and advanced camera system',
    price: 79999,
    sku: 'GALAXY-S24-ULTRA',
    images: [{ 
      public_id: 'galaxy-s24-ultra',
      url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center',
      alt: 'Samsung Galaxy S24 Ultra',
      isMain: true
    }],
    inventory: { quantity: 35 },
    status: 'active',
    featured: true,
    tags: ['smartphone', 'android', 'samsung', 'premium', 'mobile', 'electronics']
  },
  {
    name: 'Dell XPS 13',
    slug: 'dell-xps-13',
    description: 'Ultra-thin laptop with InfinityEdge display and powerful performance',
    price: 89999,
    sku: 'DELL-XPS-13',
    images: [{ 
      public_id: 'dell-xps-13',
      url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop&crop=center',
      alt: 'Dell XPS 13',
      isMain: true
    }],
    inventory: { quantity: 20 },
    status: 'active',
    featured: true,
    tags: ['laptop', 'dell', 'ultrabook', 'computer', 'portable', 'electronics']
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    slug: 'sony-wh-1000xm5',
    description: 'Industry-leading noise canceling wireless headphones',
    price: 24999,
    sku: 'SONY-WH-1000XM5',
    images: [{ 
      public_id: 'sony-headphones',
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center',
      alt: 'Sony WH-1000XM5 Headphones',
      isMain: true
    }],
    inventory: { quantity: 60 },
    status: 'active',
    featured: true,
    tags: ['headphones', 'wireless', 'sony', 'noise-canceling', 'audio', 'electronics']
  },
  {
    name: 'iPad Pro 12.9"',
    slug: 'ipad-pro-12-9',
    description: 'Professional tablet with M2 chip and Apple Pencil support',
    price: 91999,
    sku: 'IPAD-PRO-12-9',
    images: [{ 
      public_id: 'ipad-pro',
      url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop&crop=center',
      alt: 'iPad Pro 12.9"',
      isMain: true
    }],
    inventory: { quantity: 25 },
    status: 'active',
    featured: true,
    tags: ['tablet', 'apple', 'professional', 'ipad', 'creative', 'electronics']
  },
  {
    name: 'Canon EOS R6 Mark II',
    slug: 'canon-eos-r6-mark-ii',
    description: 'Professional mirrorless camera with 4K video recording',
    price: 207499,
    sku: 'CANON-R6-MARK-II',
    images: [{ 
      public_id: 'canon-camera',
      url: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=400&fit=crop&crop=center',
      alt: 'Canon EOS R6 Mark II',
      isMain: true
    }],
    inventory: { quantity: 15 },
    status: 'active',
    featured: true,
    tags: ['camera', 'canon', 'professional', 'photography', 'mirrorless', 'electronics']
  },
  {
    name: 'Apple Watch Series 9',
    slug: 'apple-watch-series-9',
    description: 'Advanced smartwatch with health monitoring and fitness tracking',
    price: 33249,
    sku: 'APPLE-WATCH-S9',
    images: [{ 
      public_id: 'apple-watch',
      url: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop&crop=center',
      alt: 'Apple Watch Series 9',
      isMain: true
    }],
    inventory: { quantity: 80 },
    status: 'active',
    featured: true,
    tags: ['smartwatch', 'apple', 'health', 'fitness', 'wearable', 'electronics']
  },
  // Clothing
  {
    name: 'Casual Denim Jeans',
    slug: 'casual-denim-jeans',
    description: 'Classic blue denim jeans with comfortable fit',
    price: 2499,
    sku: 'DENIM-JEANS',
    images: [{ 
      public_id: 'denim-jeans',
      url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop&crop=center',
      alt: 'Casual Denim Jeans',
      isMain: true
    }],
    inventory: { quantity: 150 },
    status: 'active',
    featured: false,
    tags: ['jeans', 'denim', 'casual', 'clothing', 'pants']
  },
  {
    name: 'Formal White Shirt',
    slug: 'formal-white-shirt',
    description: 'Premium cotton formal shirt perfect for office wear',
    price: 2999,
    sku: 'FORMAL-SHIRT',
    images: [{ 
      public_id: 'formal-shirt',
      url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop&crop=center',
      alt: 'Formal White Shirt',
      isMain: true
    }],
    inventory: { quantity: 100 },
    status: 'active',
    featured: true,
    tags: ['shirt', 'formal', 'cotton', 'clothing', 'office']
  },
  {
    name: 'Summer Floral Dress',
    slug: 'summer-floral-dress',
    description: 'Light and breezy floral dress perfect for summer occasions',
    price: 3499,
    sku: 'FLORAL-DRESS',
    images: [{ 
      public_id: 'floral-dress',
      url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop&crop=center',
      alt: 'Summer Floral Dress',
      isMain: true
    }],
    inventory: { quantity: 75 },
    status: 'active',
    featured: true,
    tags: ['dress', 'floral', 'summer', 'clothing', 'women']
  },
  {
    name: 'Leather Jacket',
    slug: 'leather-jacket',
    description: 'Classic black leather jacket with premium finish',
    price: 8999,
    sku: 'LEATHER-JACKET',
    images: [{ 
      public_id: 'leather-jacket',
      url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop&crop=center',
      alt: 'Leather Jacket',
      isMain: true
    }],
    inventory: { quantity: 40 },
    status: 'active',
    featured: true,
    tags: ['jacket', 'leather', 'clothing', 'premium', 'outerwear']
  },
  {
    name: 'Running Shoes',
    slug: 'running-shoes',
    description: 'Comfortable athletic shoes designed for running and sports',
    price: 4999,
    sku: 'RUNNING-SHOES',
    images: [{ 
      public_id: 'running-shoes',
      url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center',
      alt: 'Running Shoes',
      isMain: true
    }],
    inventory: { quantity: 120 },
    status: 'active',
    featured: true,
    tags: ['shoes', 'running', 'athletic', 'clothing', 'sports']
  },
  {
    name: 'Winter Wool Sweater',
    slug: 'winter-wool-sweater',
    description: 'Warm and cozy wool sweater for cold weather',
    price: 3999,
    sku: 'WOOL-SWEATER',
    images: [{ 
      public_id: 'wool-sweater',
      url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop&crop=center',
      alt: 'Winter Wool Sweater',
      isMain: true
    }],
    inventory: { quantity: 90 },
    status: 'active',
    featured: false,
    tags: ['sweater', 'wool', 'winter', 'clothing', 'warm']
  },
  // Books
  {
    name: 'JavaScript: The Complete Guide',
    slug: 'javascript-complete-guide',
    description: 'Comprehensive guide to modern JavaScript programming',
    price: 3299,
    sku: 'JS-COMPLETE-GUIDE',
    images: [{ 
      public_id: 'javascript-book',
      url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop&crop=center',
      alt: 'JavaScript Complete Guide',
      isMain: true
    }],
    inventory: { quantity: 85 },
    status: 'active',
    featured: true,
    tags: ['books', 'javascript', 'programming', 'education', 'web-development']
  },
  {
    name: 'Python for Data Science',
    slug: 'python-data-science',
    description: 'Master data analysis and machine learning with Python',
    price: 4199,
    sku: 'PYTHON-DATA-SCI',
    images: [{ 
      public_id: 'python-book',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center',
      alt: 'Python for Data Science',
      isMain: true
    }],
    inventory: { quantity: 70 },
    status: 'active',
    featured: true,
    tags: ['books', 'python', 'data-science', 'programming', 'education']
  },
  {
    name: 'Design Patterns in Software Engineering',
    slug: 'design-patterns-book',
    description: 'Essential design patterns for software developers',
    price: 3799,
    sku: 'DESIGN-PATTERNS',
    images: [{ 
      public_id: 'design-patterns',
      url: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=400&fit=crop&crop=center',
      alt: 'Design Patterns Book',
      isMain: true
    }],
    inventory: { quantity: 60 },
    status: 'active',
    featured: false,
    tags: ['books', 'software', 'programming', 'patterns', 'education']
  },
  {
    name: 'Fiction Novel Collection',
    slug: 'fiction-novel-collection',
    description: 'Bestselling fiction novels from award-winning authors',
    price: 2799,
    sku: 'FICTION-NOVELS',
    images: [{ 
      public_id: 'fiction-novels',
      url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&crop=center',
      alt: 'Fiction Novel Collection',
      isMain: true
    }],
    inventory: { quantity: 95 },
    status: 'active',
    featured: true,
    tags: ['books', 'fiction', 'novels', 'literature', 'entertainment']
  },
  {
    name: 'History of Ancient Civilizations',
    slug: 'ancient-civilizations',
    description: 'Comprehensive history of ancient world civilizations',
    price: 4499,
    sku: 'ANCIENT-HISTORY',
    images: [{ 
      public_id: 'history-book',
      url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&crop=center',
      alt: 'History of Ancient Civilizations',
      isMain: true
    }],
    inventory: { quantity: 45 },
    status: 'active',
    featured: false,
    tags: ['books', 'history', 'ancient', 'civilizations', 'education']
  },
  // Home & Garden
  {
    name: 'Robot Vacuum Cleaner',
    slug: 'robot-vacuum-cleaner',
    description: 'Smart robotic vacuum with app control and mapping',
    price: 19999,
    sku: 'ROBOT-VACUUM',
    images: [{ 
      public_id: 'robot-vacuum',
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center',
      alt: 'Robot Vacuum Cleaner',
      isMain: true
    }],
    inventory: { quantity: 30 },
    status: 'active',
    featured: true,
    tags: ['home', 'vacuum', 'robot', 'cleaning', 'smart', 'appliance']
  },
  {
    name: 'Ceramic Plant Pots Set',
    slug: 'ceramic-plant-pots',
    description: 'Beautiful set of ceramic pots for indoor plants',
    price: 1999,
    sku: 'CERAMIC-POTS',
    images: [{ 
      public_id: 'plant-pots',
      url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop&crop=center',
      alt: 'Ceramic Plant Pots',
      isMain: true
    }],
    inventory: { quantity: 100 },
    status: 'active',
    featured: false,
    tags: ['home', 'garden', 'pots', 'ceramic', 'plants', 'decor']
  },
  {
    name: 'LED Desk Lamp',
    slug: 'led-desk-lamp',
    description: 'Adjustable LED desk lamp with touch controls',
    price: 2999,
    sku: 'LED-DESK-LAMP',
    images: [{ 
      public_id: 'desk-lamp',
      url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop&crop=center',
      alt: 'LED Desk Lamp',
      isMain: true
    }],
    inventory: { quantity: 80 },
    status: 'active',
    featured: true,
    tags: ['home', 'lamp', 'led', 'desk', 'lighting', 'office']
  },
  {
    name: 'Kitchen Knife Set',
    slug: 'kitchen-knife-set',
    description: 'Professional stainless steel kitchen knives with wooden block',
    price: 5999,
    sku: 'KITCHEN-KNIVES',
    images: [{ 
      public_id: 'kitchen-knives',
      url: 'https://images.unsplash.com/photo-1594736797933-d0301ba6fe65?w=400&h=400&fit=crop&crop=center',
      alt: 'Kitchen Knife Set',
      isMain: true
    }],
    inventory: { quantity: 50 },
    status: 'active',
    featured: true,
    tags: ['home', 'kitchen', 'knives', 'cooking', 'utensils', 'steel']
  },
  {
    name: 'Outdoor Garden Tools Set',
    slug: 'garden-tools-set',
    description: 'Complete set of essential gardening tools',
    price: 3499,
    sku: 'GARDEN-TOOLS',
    images: [{ 
      public_id: 'garden-tools',
      url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&crop=center',
      alt: 'Garden Tools Set',
      isMain: true
    }],
    inventory: { quantity: 65 },
    status: 'active',
    featured: false,
    tags: ['garden', 'tools', 'outdoor', 'gardening', 'home', 'plants']
  }
];

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Clear existing data completely
    console.log('Clearing existing data...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    await Order.deleteMany({});
    
    console.log('Creating admin user...');
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Admin user created successfully');

    // Create additional users for better stats
    console.log('Creating additional users...');
    const additionalUsers = [];
    for (let i = 0; i < 10; i++) {
      const userData = {
        firstName: `User`,
        lastName: `${i + 1}`,
        email: `user${i + 1}@example.com`,
        password: 'password123',
        role: 'user',
        isActive: true,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000) // Random date within last 90 days
      };
      
      try {
        const user = await User.create(userData);
        additionalUsers.push(user);
        console.log(`Created user: ${user.firstName} ${user.lastName}`);
      } catch (error) {
        console.error(`Error creating user ${userData.firstName} ${userData.lastName}:`, error.message);
      }
    }

    console.log('Creating categories...');
    const categories = await Category.insertMany(sampleCategories);
    console.log('Categories created successfully');
    
    console.log('Creating products...');
    const createdProducts = [];
    for (const productData of sampleProducts) {
      try {
        // Find the appropriate category based on product tags
        let category;
        
        if (productData.tags.includes('electronics')) {
          category = categories.find(cat => cat.name === 'Electronics');
        } else if (productData.tags.includes('clothing')) {
          category = categories.find(cat => cat.name === 'Clothing');
        } else if (productData.tags.includes('books')) {
          category = categories.find(cat => cat.name === 'Books');
        } else if (productData.tags.includes('home') || productData.tags.includes('garden')) {
          category = categories.find(cat => cat.name === 'Home & Garden');
        } else {
          // Default fallback
          category = categories[0];
        }
        
        console.log(`Creating product ${productData.name} with category ${category.name}`);
        
        const product = await Product.create({
          ...productData,
          category: category._id,
          createdBy: adminUser._id
        });
        createdProducts.push(product);
        console.log(`Created product: ${product.name} with ID: ${product._id}`);
      } catch (error) {
        console.error(`Error creating product ${productData.name}:`, error.message);
        if (error.errors) {
          for (const field in error.errors) {
            console.error(`  ${field}: ${error.errors[field].message}`);
          }
        }
      }
    }
    
    // Create sample orders
    console.log('Creating sample orders...');
    const sampleOrders = [];
    const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    for (let i = 0; i < 20; i++) {
      const randomProducts = createdProducts.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);
      const orderItems = randomProducts.map(product => ({
        product: product._id,
        productName: product.name,
        productImage: product.images[0],
        quantity: Math.floor(Math.random() * 3) + 1,
        unitPrice: product.price,
        totalPrice: product.price * (Math.floor(Math.random() * 3) + 1)
      }));
      
      const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const randomStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      
      const orderData = {
        orderNumber: `ORD-${Date.now()}-${i}`,
        user: adminUser._id,
        items: orderItems,
        subtotal: subtotal,
        totalAmount: subtotal,
        status: randomStatus,
        paymentMethod: 'cash_on_delivery',
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          addressLine1: `${Math.floor(Math.random() * 999)} Main St`,
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States',
          phone: '+1234567890'
        },
        billingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          addressLine1: `${Math.floor(Math.random() * 999)} Main St`,
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States',
          phone: '+1234567890'
        },
        statusHistory: [{
          status: randomStatus,
          note: `Order ${randomStatus}`,
          updatedBy: adminUser._id
        }],
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random date within last 30 days
      };
      
      try {
        const order = await Order.create(orderData);
        sampleOrders.push(order);
        console.log(`Created sample order: ${order.orderNumber}`);
      } catch (error) {
        console.error(`Error creating order:`, error.message);
      }
    }
    
    console.log(`Successfully seeded database with:`);
    console.log(`- 1 admin user`);
    console.log(`- ${additionalUsers.length} regular users`);
    console.log(`- ${categories.length} categories`);
    console.log(`- ${createdProducts.length} products`);
    console.log(`- ${sampleOrders.length} sample orders`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

const runSeeder = async () => {
  await connectDB();
  await seedDatabase();
};

if (require.main === module) {
  runSeeder();
}

module.exports = { seedDatabase, connectDB };
