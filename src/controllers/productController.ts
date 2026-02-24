// Create a new product : Only seller 
    // 1. Seller authentication and authorization
    // 2. Validate product data (name, description, price, etc.)
    // 3. Handle product images (upload to cloud storage)
    // 4. Save product details in the database
    // 5. Return success response with product details
    
// Get all products with pagination and filtering : Public route
    // 1. Parse query parameters for pagination (page, limit) and filtering (category, price range, etc.)
    // 2. Fetch products from the database based on filters and pagination
    // 3. Return products in the response along with pagination info

// Get single product details by ID : Public route (only active products)
    // 1. Validate product ID
    // 2. Fetch product details from the database
    // 3. Return product details in the response

// Get single product details by ID for seller : Only seller can access their own product details
    // 1. Seller authentication and authorization
    // 2. Validate product ID
    // 3. Fetch product details from the database if it belongs to the authenticated seller
    // 4. Return product details in the response

// Get products by seller ID : Only seller can access their own products
    // 1. Seller authentication and authorization
    // 2. Validate seller ID
    // 3. Fetch products from the database that belong to the specified seller
    // 4. Return products in the response

// Get products by category ID : Public route (only active products)
    // 1. Validate category ID
    // 2. Fetch products from the database that belong to the specified category and are active
    // 3. Return products in the response

// Update product details : Only seller can update their own products
    // 1. Seller authentication and authorization
    // 2. Validate product ID and update data
    // 3. Fetch product from the database and check if it belongs to the authenticated seller
    // 4. Update product images if new images are provided (handle upload to cloud storage and delete old images)
    // 5. Update product details in the database
    // 6. Return success response with updated product details

// Delete a product : Only seller can delete their own products
    // 1. Seller authentication and authorization
    // 2. Validate product ID
    // 3. Fetch product from the database and check if it belongs to the authenticated seller
    // 4. Soft delete the product in the database (mark as inactive or deleted)
    // 5. Return success response confirming deletion

// Hard delete a product : Only admin can hard delete any product
    // 1. Admin authentication and authorization
    // 2. Validate product ID
    // 3. Fetch product from the database
    // 4. Permanently delete the product from the database
    // 5. Return success response confirming hard deletion

// Restore a soft-deleted product : Only seller can restore their own products
    // 1. Seller authentication and authorization
    // 2. Validate product ID
    // 3. Fetch product from the database and check if it belongs to the authenticated seller
    // 4. Restore the soft-deleted product in the database (mark as active)
    // 5. Return success response confirming restoration
