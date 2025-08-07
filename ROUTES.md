# Complete Route Documentation - PTFO E-commerce Application

## Frontend Routes (React Router)

### Public Routes (No Authentication Required)

#### Main Navigation
| Route | Component | Description | Testing Notes |
|-------|-----------|-------------|---------------|
| `/` | Home | Homepage with featured products, hero section | Test product display, navigation links |
| `/products` | Products | Product listing with filters and pagination | Test filtering, search, pagination |
| `/products/:id` | ProductDetail | Individual product page with reviews | Test product details, add to cart, reviews |
| `/categories` | Categories | Product categories listing and navigation | Test category filtering, navigation |
| `/search` | Search | Advanced product search with filters | Test search functionality, filters, sorting |
| `/about` | About | Company information, team, values | Test static content, navigation |
| `/contact` | Contact | Contact form, FAQ, company info | Test form submission, validation |
| `/cart` | Cart | Shopping cart items and management | Test cart operations, quantity updates |

#### Authentication Routes
| Route | Component | Description | Testing Notes |
|-------|-----------|-------------|---------------|
| `/login` | Login | User login form | Test login validation, redirect behavior |
| `/register` | Register | User registration form | Test registration validation, auto-login |

### Protected Routes (Authentication Required)

#### User Account Management
| Route | Component | Description | Testing Notes |
|-------|-----------|-------------|---------------|
| `/profile` | Profile | User profile management | Test profile updates, password change |
| `/orders` | Orders | Order history and tracking | Test order display, status updates |
| `/wishlist` | Wishlist | Saved products list | Test add/remove items, navigation to products |
| `/checkout` | Checkout | Order checkout process | Test payment flow, address validation |

### Admin Routes (Admin Role Required)

#### Administrative Dashboard
| Route | Component | Description | Testing Notes |
|-------|-----------|-------------|---------------|
| `/admin` | AdminDashboard | Main admin dashboard | Test admin-only access, statistics display |
| `/admin/dashboard` | AdminDashboard | Alternative admin dashboard route | Test same functionality as `/admin` |

### Error Handling
| Route | Component | Description |
|-------|-----------|-------------|
| `*` | 404 Component | Fallback for undefined routes |

---

## Backend API Routes (Express.js)

### Base URL: `http://localhost:5001/api`

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| POST | `/register` | User registration | No | No |
| POST | `/login` | User login | No | No |
| GET | `/me` | Get current user profile | Yes | No |
| PUT | `/profile` | Update user profile | Yes | No |
| PUT | `/password` | Change password | Yes | No |
| POST | `/logout` | User logout | Yes | No |

### Product Routes (`/api/products`)
| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/` | Get all products (with filters, pagination) | No | No |
| GET | `/featured` | Get featured products | No | No |
| GET | `/search` | Search products | No | No |
| GET | `/:id` | Get single product | No | No |
| POST | `/` | Create new product | Yes | Yes |
| PUT | `/:id` | Update product | Yes | Yes |
| DELETE | `/:id` | Delete product | Yes | Yes |

### Category Routes (`/api/categories`)
| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/` | Get all categories | No | No |
| GET | `/:id` | Get single category | No | No |
| POST | `/` | Create new category | Yes | Yes |
| PUT | `/:id` | Update category | Yes | Yes |
| DELETE | `/:id` | Delete category | Yes | Yes |

### Order Routes (`/api/orders`)
| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/` | Get user orders (or all orders for admin) | Yes | No |
| GET | `/:id` | Get single order | Yes | No |
| POST | `/` | Create new order | Yes | No |
| PUT | `/:id/status` | Update order status | Yes | Yes |
| PUT | `/:id/cancel` | Cancel order | Yes | No |

### User Management Routes (`/api/users`)
| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/` | Get all users | Yes | Yes |
| GET | `/:id` | Get single user | Yes | Yes |
| PUT | `/:id` | Update user | Yes | Yes |
| DELETE | `/:id` | Delete user | Yes | Yes |
| PUT | `/:id/role` | Update user role | Yes | Yes |

### Cart Routes (`/api/cart`)
| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/` | Get user cart | Yes | No |
| POST | `/add` | Add item to cart | Yes | No |
| PUT | `/update` | Update cart item quantity | Yes | No |
| DELETE | `/remove/:productId` | Remove item from cart | Yes | No |
| DELETE | `/clear` | Clear entire cart | Yes | No |

### Wishlist Routes (`/api/wishlist`)
| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/` | Get user wishlist | Yes | No |
| POST | `/add` | Add item to wishlist | Yes | No |
| DELETE | `/remove/:productId` | Remove item from wishlist | Yes | No |

### Review Routes (`/api/reviews`)
| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/product/:productId` | Get product reviews | No | No |
| POST | `/` | Create new review | Yes | No |
| PUT | `/:id` | Update review | Yes | No |
| DELETE | `/:id` | Delete review | Yes | No |

### Upload Routes (`/api/upload`)
| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| POST | `/image` | Upload single image | Yes | Yes |
| POST | `/images` | Upload multiple images | Yes | Yes |

### Payment Routes (`/api/payment`)
| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| POST | `/create-intent` | Create payment intent | Yes | No |
| POST | `/confirm` | Confirm payment | Yes | No |
| GET | `/methods` | Get user payment methods | Yes | No |

### System Routes
| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/health` | Health check endpoint | No | No |

---

## Testing Checklist

### Frontend Testing

#### User Journey Testing
1. **Guest User Flow**
   - [ ] Browse products without login
   - [ ] View product details
   - [ ] Add items to cart
   - [ ] View cart contents
   - [ ] Attempt checkout (should redirect to login)

2. **Registration/Login Flow**
   - [ ] Register new account
   - [ ] Email validation
   - [ ] Login with credentials
   - [ ] Remember login state
   - [ ] Logout functionality

3. **Authenticated User Flow**
   - [ ] Complete checkout process
   - [ ] View order history
   - [ ] Manage profile
   - [ ] Use wishlist
   - [ ] Leave product reviews

4. **Admin User Flow**
   - [ ] Access admin dashboard
   - [ ] View admin statistics
   - [ ] Manage products (CRUD)
   - [ ] Manage categories
   - [ ] View all orders

#### Navigation Testing
- [ ] All navigation links work correctly
- [ ] Breadcrumb navigation
- [ ] Mobile responsive navigation
- [ ] Footer links
- [ ] Search functionality

#### Form Testing
- [ ] Registration form validation
- [ ] Login form validation
- [ ] Contact form submission
- [ ] Profile update forms
- [ ] Product review forms
- [ ] Checkout forms

### Backend Testing

#### API Endpoint Testing
- [ ] All GET endpoints return correct data
- [ ] POST endpoints create resources correctly
- [ ] PUT endpoints update resources
- [ ] DELETE endpoints remove resources
- [ ] Authentication middleware works
- [ ] Admin-only endpoints are protected
- [ ] Error handling returns appropriate status codes

#### Database Testing
- [ ] MongoDB connection established
- [ ] Data persistence across requests
- [ ] Proper indexing for performance
- [ ] Data validation rules enforced

#### Security Testing
- [ ] JWT token validation
- [ ] Password hashing
- [ ] Rate limiting functionality
- [ ] CORS configuration
- [ ] Input sanitization

---

## Environment Configuration

### Frontend Environment Variables (.env)
```
REACT_APP_API_URL=http://localhost:5001
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
REACT_APP_FACEBOOK_URL=https://facebook.com/ptfostore
REACT_APP_TWITTER_URL=https://twitter.com/ptfostore
REACT_APP_INSTAGRAM_URL=https://instagram.com/ptfostore
REACT_APP_LINKEDIN_URL=https://linkedin.com/company/ptfostore
```

### Backend Environment Variables (.env)
```
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/ptfo_ecommerce
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

---

## Quick Start Testing Commands

### Start the Application
```bash
# Backend (Terminal 1)
cd backend
npm start

# Frontend (Terminal 2)
cd frontend
npm start
```

### Test URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api
- **Health Check**: http://localhost:5001/api/health

### Sample Admin Account
For testing admin functionality, create an admin user through the API or database directly.

---

## Notes for Complete Testing

1. **Database Setup**: Ensure MongoDB is running and populated with sample data
2. **File Uploads**: Configure Cloudinary for image uploads
3. **Payment Testing**: Use Stripe test keys for payment functionality
4. **Email Testing**: Configure SMTP for email notifications
5. **Mobile Testing**: Test all routes on mobile devices
6. **Performance Testing**: Check loading times and optimization
7. **Error Handling**: Test all error scenarios and edge cases

This documentation provides a complete overview of all available routes and testing procedures for the PTFO e-commerce application.
