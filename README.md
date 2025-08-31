Installation

1. Clone the repository
git clone https://github.com/Asyedibrahim/MERN-Task

2. Installation
npm i
cd frontend
npm i

3. Set up environment variables
Create a .env file in the root directory with the following variables:
MONGODB_URI=mongodb://localhost:27017/product-management
JWT_SECRET=your_jwt_secret

4. Start MongoDB
Make sure MongoDB is running on your system:

# Development mode
npm run dev

# API Endpoints
Method	        Endpoint	                    Description
GET	        /api/products/search	            Get products with pagination and filters
GET	        /api/products/categories	        Get all product categories
POST	    /api/products/import	            Import products from CSV
PUT	        /api/products/update-multiple	    Update multiple products at once
GET	        /api/products/export	            Export products to CSV
PUT	        /api/products/:id	                Update a specific product
DELETE	    /api/products/:id	                Delete a specific product
GET	        /api/products/:id/history	        Get stock history for a product

# CSV Format
The import CSV should have the following columns:

name (required): Product name

unit: Measurement unit

category: Product category

brand: Product brand

stock: Quantity in stock (number)

status: Stock status (In Stock/Out of Stock)

image: URL to product image