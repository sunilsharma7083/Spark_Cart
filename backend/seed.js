const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Product = require('./models/Product');
const Category = require('./models/Category');
const User = require('./models/User');
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
      url: 'https://via.placeholder.com/100x100?text=Electronics'
    }
  },
  {
    name: 'Clothing',
    slug: 'clothing',
    description: 'Fashion and apparel for all occasions',
    image: {
      url: 'https://via.placeholder.com/100x100?text=Clothing'
    }
  },
  {
    name: 'Books',
    slug: 'books',
    description: 'Wide selection of books and literature',
    image: {
      url: 'https://via.placeholder.com/100x100?text=Books'
    }
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Everything for your home and garden',
    image: {
      url: 'https://via.placeholder.com/100x100?text=Home'
    }
  }
];

const sampleProducts = [
  {
    name: 'iPhone 15 Pro',
    slug: 'iphone-15-pro',
    description: 'Latest iPhone with advanced features and premium build quality',
    price: 999.99,
    sku: 'IPHONE15PRO',
    images: [{ 
      public_id: 'iphone15pro',
      url: 'https://via.placeholder.com/400x400?text=iPhone+15+Pro',
      alt: 'iPhone 15 Pro',
      isMain: true
    }],
    inventory: { quantity: 50 },
    status: 'active',
    featured: true,
    tags: ['smartphone', 'phone', 'apple', 'premium', 'mobile']
  },
  {
    name: 'MacBook Air M3',
    slug: 'macbook-air-m3',
    description: 'Powerful and lightweight laptop perfect for professionals',
    price: 1299.99,
    sku: 'MACBOOK-AIR-M3',
    images: [{ 
      public_id: 'macbook-air-m3',
      url: 'https://via.placeholder.com/400x400?text=MacBook+Air',
      alt: 'MacBook Air M3',
      isMain: true
    }],
    inventory: { quantity: 30 },
    status: 'active',
    featured: true,
    tags: ['laptop', 'apple', 'professional', 'computer', 'macbook']
  },
  {
    name: 'AirPods Pro',
    slug: 'airpods-pro',
    description: 'Premium wireless earbuds with noise cancellation',
    price: 249.99,
    sku: 'AIRPODS-PRO',
    images: [{ 
      public_id: 'airpods-pro',
      url: 'https://via.placeholder.com/400x400?text=AirPods+Pro',
      alt: 'AirPods Pro',
      isMain: true
    }],
    inventory: { quantity: 100 },
    status: 'active',
    featured: true,
    tags: ['earbuds', 'wireless', 'apple', 'headphones', 'audio']
  },
  {
    name: 'Cotton T-Shirt',
    slug: 'cotton-t-shirt',
    description: 'Comfortable 100% cotton t-shirt in various colors',
    price: 19.99,
    sku: 'COTTON-TSHIRT',
    images: [{ 
      public_id: 'cotton-tshirt',
      url: 'https://via.placeholder.com/400x400?text=T-Shirt',
      alt: 'Cotton T-Shirt',
      isMain: true
    }],
    inventory: { quantity: 200 },
    status: 'active',
    featured: false,
    tags: ['clothing', 'cotton', 'casual']
  },
  {
    name: 'Programming Book Collection',
    slug: 'programming-book-collection',
    description: 'Essential books for learning programming and software development',
    price: 89.99,
    sku: 'PROG-BOOKS',
    images: [{ 
      public_id: 'programming-books',
      url: 'https://via.placeholder.com/400x400?text=Programming+Books',
      alt: 'Programming Books',
      isMain: true
    }],
    inventory: { quantity: 75 },
    status: 'active',
    featured: true,
    tags: ['books', 'programming', 'education']
  },
  {
    name: 'Smart Garden Kit',
    slug: 'smart-garden-kit',
    description: 'Automated garden kit for growing herbs and vegetables indoors',
    price: 149.99,
    sku: 'SMART-GARDEN',
    images: [{ 
      public_id: 'smart-garden',
      url: 'https://via.placeholder.com/400x400?text=Smart+Garden',
      alt: 'Smart Garden Kit',
      isMain: true
    }],
    inventory: { quantity: 25 },
    status: 'active',
    featured: true,
    tags: ['garden', 'smart', 'indoor']
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
    
    console.log('Creating admin user...');
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Admin user created successfully');

    console.log('Creating categories...');
    const categories = await Category.insertMany(sampleCategories);
    console.log('Categories created successfully');
    
    console.log('Creating products...');
    const createdProducts = [];
    for (const productData of sampleProducts) {
      try {
        // Find the appropriate category
        const category = categories.find(cat => 
          productData.tags.some(tag => cat.name.toLowerCase().includes(tag)) ||
          cat.name.toLowerCase() === 'electronics' // default for tech products
        ) || categories[0]; // fallback to first category
        
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
    
    console.log(`Successfully seeded database with:`);
    console.log(`- 1 admin user`);
    console.log(`- ${categories.length} categories`);
    console.log(`- ${createdProducts.length} products`);
    
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
